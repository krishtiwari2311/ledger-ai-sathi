import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini Flash client
const apiKey = "AIzaSyCUZ8J00EnxlmaiHYDBdQTU3MM-Cq99Vwo";
if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY is not set. Bill extraction will not work.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

type TransactionType = 'income' | 'expense';
type GSTRate = "0" | "5" | "12" | "18" | "28";

interface ExtractedData {
  type: TransactionType;
  vendor: string;
  amount: number;
  gstRate: GSTRate;
  description: string;
  date: string;
  category_id?: string;
}

export const extractTransactionData = async (file: File): Promise<ExtractedData> => {
  try {
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    });

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the prompt
    const prompt = `Please analyze this invoice/bill and extract the following information in JSON format:
    {
      "type": "expense" or "income",
      "vendor": "vendor name",
      "amount": number,
      "gstRate": "0" or "5" or "12" or "18" or "28",
      "description": "brief description",
      "date": "YYYY-MM-DD",
      "category": "one of: Marketing, Office Supplies, Travel, Software, Professional Services, Rent, Utilities, Insurance, Other"
    }
    Only return the JSON object, nothing else.`;

    // Generate content
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text by removing markdown code block formatting
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    // Parse the JSON response
    const rawData = JSON.parse(cleanedText);
    console.log('Raw data from model:', rawData);
    
    // Validate and convert GST rate
    const validGSTRates: GSTRate[] = ["0", "5", "12", "18", "28"];
    let gstRate: GSTRate = "0"; // Default to 0 if invalid
    
    if (rawData.gstRate && validGSTRates.includes(rawData.gstRate as GSTRate)) {
      gstRate = rawData.gstRate as GSTRate;
    } else if (rawData.gstRate) {
      // Try to find the closest valid GST rate
      const numericRate = Number(rawData.gstRate);
      if (!isNaN(numericRate)) {
        const closestRate = validGSTRates.reduce((prev, curr) => {
          return Math.abs(Number(curr) - numericRate) < Math.abs(Number(prev) - numericRate) ? curr : prev;
        });
        gstRate = closestRate;
      }
    }

    // Validate transaction type
    let type: TransactionType = 'expense'; // Default to expense if invalid
    if (rawData.type === 'income' || rawData.type === 'expense') {
      type = rawData.type;
    } else {
      // Try to infer type from amount or description
      const amount = Number(rawData.amount);
      const description = rawData.description.toLowerCase();
      
      // If amount is positive or description contains income-related keywords, set as income
      if (amount > 0 || 
          description.includes('payment') || 
          description.includes('received') || 
          description.includes('income')) {
        type = 'income';
      }
    }

    // Determine category based on description
    let category = 'Other';
    const description = rawData.description.toLowerCase();
    
    if (description.includes('brand') || description.includes('marketing') || description.includes('design')) {
      category = 'Marketing';
    } else if (description.includes('software') || description.includes('app') || description.includes('platform')) {
      category = 'Software';
    } else if (description.includes('consult') || description.includes('service')) {
      category = 'Professional Services';
    } else if (description.includes('office') || description.includes('supply')) {
      category = 'Office Supplies';
    } else if (description.includes('travel') || description.includes('trip')) {
      category = 'Travel';
    } else if (description.includes('rent') || description.includes('lease')) {
      category = 'Rent';
    } else if (description.includes('utility') || description.includes('electric') || description.includes('water')) {
      category = 'Utilities';
    } else if (description.includes('insurance')) {
      category = 'Insurance';
    }

    // Convert and validate the data
    const extractedData: ExtractedData = {
      type,
      vendor: rawData.vendor,
      amount: Number(rawData.amount),
      gstRate,
      description: rawData.description,
      date: rawData.date,
      category_id: category // The AddTransaction component will handle mapping this to the correct UUID
    };
    
    console.log('Final extracted data:', extractedData);
    return extractedData;
  } catch (error) {
    console.error('Error extracting data:', error);
    throw new Error('Failed to extract data from the bill');
  }
}; 