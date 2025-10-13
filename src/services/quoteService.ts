
import { CartItem, QuoteData } from '../types';
import { formatCurrency } from '../utils/formatters';
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

// Local storage key to store quotes
const QUOTES_STORAGE_KEY = 'quotes_database';
const BUCKET_NAME = 'excel_orcamentos';

// Get the next available quote number
export const getNextQuoteNumber = async (): Promise<number> => {
  try {
    // Try to get the highest quote number from Supabase
    const { data, error } = await supabase
      .from('orcamentos')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching quotes from Supabase:', error);
      // Fall back to local storage if there's an error
      return getNextLocalQuoteNumber();
    }
    
    // If we have data from Supabase, return the highest number + 1
    if (data && data.length > 0) {
      return data[0].numero + 1;
    }
    
    // If no quotes in Supabase, start from 1
    return 1;
  } catch (error) {
    console.error('Failed to get next quote number', error);
    // Fall back to local storage if there's an exception
    return getNextLocalQuoteNumber();
  }
};

// Fallback to get the next quote number from local storage
const getNextLocalQuoteNumber = (): number => {
  const quotes = getStoredQuotes();
  // If there are no quotes, start from 1, otherwise get the highest number + 1
  return quotes.length > 0 
    ? Math.max(...quotes.map(quote => quote.number)) + 1 
    : 1;
};

// Get all stored quotes from local storage
export const getStoredQuotes = (): QuoteData[] => {
  try {
    const storedQuotes = localStorage.getItem(QUOTES_STORAGE_KEY);
    return storedQuotes ? JSON.parse(storedQuotes) : [];
  } catch (error) {
    console.error('Failed to get stored quotes', error);
    return [];
  }
};

// Create Excel file and upload to Supabase Storage
async function createAndUploadExcel(quote: QuoteData): Promise<string | null> {
  try {
    // Create workbook
    const wsData = [
      ['Orçamento #', quote.number.toString()],
      ['Data', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['SKU', 'Produto', 'Cor', 'Qualidade', 'Valor Unitário', 'Quantidade', 'Subtotal'],
      ...quote.items.map((item) => {
        const unitPrice = item.product.promocao && item.product.promocao > 0
          ? Math.min(item.product.valor, item.product.promocao)
          : item.product.valor
        return [
          item.product.sku,
          item.product.modelo,
          item.product.cor,
          item.product.qualidade,
          unitPrice,
          item.quantity,
          unitPrice * item.quantity,
        ]
      }),
      [''],
      ['Total:', '', '', '', '', '', quote.total],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orçamento');
    
    // Convert to binary
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Upload to Supabase Storage
    const filePath = `orcamento-${quote.number}-${Date.now()}.xlsx`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, excelBlob, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading Excel file to Supabase:', error);
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error creating/uploading Excel file:', error);
    return null;
  }
}

// Save a new quote to Supabase and local storage
export const saveQuote = async (items: CartItem[]): Promise<QuoteData> => {
  try {
    // Get the next quote number
    const quoteNumber = await getNextQuoteNumber();
    
    // Calculate total
    const total = items.reduce((sum, item) => {
      const unitPrice = item.product.promocao && item.product.promocao > 0
        ? Math.min(item.product.valor, item.product.promocao)
        : item.product.valor
      return sum + unitPrice * item.quantity
    }, 0);

    // Create the quote object
    const excelFilename = `orcamento-${quoteNumber}-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    const newQuote: QuoteData = {
      id: crypto.randomUUID(),
      number: quoteNumber,
      items,
      total,
      date: new Date().toISOString(),
      excelFilename
    };

    // Upload Excel file and get public URL
    const excelLink = await createAndUploadExcel(newQuote);
    
    // Save quote to Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('orcamentos')
      .insert({
        numero: quoteNumber,
        items: items,
        total: total,
        excel_filename: excelFilename,
        excel_link: excelLink
      })
      .select()
      .single();
    
    if (supabaseError) {
      console.error('Error saving quote to Supabase:', supabaseError);
      // Fall back to local storage if Supabase fails
      return saveToLocalStorage(newQuote);
    }
    
    // Update the quote ID with the one from Supabase
    if (supabaseData) {
      newQuote.id = supabaseData.id;
      newQuote.excelLink = excelLink;
      
      // Still save to localStorage as a backup
      saveToLocalStorage(newQuote);
    }
    
    return newQuote;
  } catch (error) {
    console.error('Failed to save quote:', error);
    // Fall back to local storage if there's an exception
    const quoteNumber = getNextLocalQuoteNumber();
    const localQuote: QuoteData = {
      id: crypto.randomUUID(),
      number: quoteNumber,
      items,
      total: items.reduce((sum, item) => {
        const unitPrice = item.product.promocao && item.product.promocao > 0
          ? Math.min(item.product.valor, item.product.promocao)
          : item.product.valor
        return sum + unitPrice * item.quantity
      }, 0),
      date: new Date().toISOString(),
      excelFilename: `orcamento-${quoteNumber}-${new Date().toISOString().split('T')[0]}.xlsx`
    };
    return saveToLocalStorage(localQuote);
  }
};

// Helper function to save to local storage
function saveToLocalStorage(quote: QuoteData): QuoteData {
  try {
    const quotes = getStoredQuotes();
    quotes.push(quote);
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
    return quote;
  } catch (error) {
    console.error('Failed to save quote to local storage:', error);
    return quote;
  }
}

// Generate a shareable link for a quote with its excel file
export const getShareableQuoteLink = (quote: QuoteData): string => {
  if (quote.excelLink) {
    return quote.excelLink;
  }
  
  // Fallback if no excel link is available
  return `https://orcamentos.example.com/excel/${quote.id}`;
};
