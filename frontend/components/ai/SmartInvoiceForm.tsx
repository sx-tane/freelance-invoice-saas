import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Wand2, DollarSign, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface SmartInvoiceFormProps {
  onSubmit: (data: any) => void;
  clientId?: number;
}

interface InvoiceFormData {
  description: string;
  amount?: number;
  clientId?: number;
  items: { description: string; quantity: number; rate: number }[];
}

interface AISuggestion {
  type: 'pricing' | 'description' | 'categorization';
  content: string;
  confidence: number;
}

export default function SmartInvoiceForm({ onSubmit, clientId }: SmartInvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [pricingSuggestion, setPricingSuggestion] = useState<any>(null);

  const { register, handleSubmit, watch, setValue, getValues } = useForm<InvoiceFormData>({
    defaultValues: {
      items: [{ description: '', quantity: 1, rate: 0 }],
    },
  });

  const watchedItems = watch('items');

  const handleChatInvoiceCreation = async () => {
    if (!chatMessage.trim()) return;

    try {
      setIsLoading(true);
      // Make actual API call to AI invoice parsing endpoint
      const response = await api.post('/ai/parse-invoice', { message: chatMessage });
      const data = response.data;
      
      if (data.confidence > 0.6) {
        if (data.description) setValue('description', data.description);
        if (data.amount) setValue('amount', data.amount);
        if (data.items && data.items.length > 0) {
          setValue('items', data.items);
        }
        
        toast.success('Invoice details extracted from your message!');
        setShowChatInput(false);
        setChatMessage('');
      } else {
        toast.error('Could not extract clear invoice details. Please try rephrasing.');
      }
    } catch (error) {
      toast.error('Error processing your message');
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeItems = async () => {
    const items = getValues('items').filter(item => item.description.trim());
    if (items.length === 0) return;

    try {
      setIsLoading(true);
      // Make actual API call to AI categorization endpoint
      const response = await api.post('/ai/categorize-items', { 
        items: items.map(item => item.description) 
      });
      const data = response.data;
      
      const newSuggestions: AISuggestion[] = data.categories.map((cat: any, index: number) => ({
        type: 'categorization' as const,
        content: `${items[index].description} → ${cat.category}`,
        confidence: cat.confidence,
      }));
      
      setAiSuggestions(prev => [...prev, ...newSuggestions]);
      toast.success('Items categorized using AI!');
    } catch (error) {
      toast.error('Error categorizing items');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDescription = async () => {
    const items = getValues('items');
    const projectDetails = items.map(item => item.description).join(', ');
    
    if (!projectDetails.trim()) {
      toast.error('Please add some items first');
      return;
    }

    try {
      setIsLoading(true);
      // Make actual API call to AI description generation endpoint
      const response = await api.post('/ai/generate-description', { items: projectDetails });
      const data = response.data;
      setValue('description', data.description);
      
      toast.success('Professional description generated!');
    } catch (error) {
      toast.error('Error generating description');
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestedPricing = async () => {
    const description = getValues('description');
    if (!description || description.length < 10) return;

    try {
      setIsLoading(true);
      // Make actual API call to AI pricing suggestion endpoint
      const response = await api.post('/ai/suggest-pricing', { description });
      const data = response.data;
      setPricingSuggestion(data);
      
      if (data.confidence > 0.7) {
        toast.success(`AI suggests $${data.suggestedPrice} based on similar work`);
      }
    } catch (error) {
      console.error('Error getting pricing suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestedPricing = () => {
    if (pricingSuggestion) {
      setValue('amount', pricingSuggestion.suggestedPrice);
      toast.success('Pricing suggestion applied!');
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Chat Interface */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowChatInput(!showChatInput)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            {showChatInput ? 'Hide' : 'Create invoice from text'}
          </button>
        </div>
        
        {showChatInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Describe your invoice in natural language, e.g., 'Create invoice for John Smith for $2500 web development work due next Friday'"
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleChatInvoiceCreation}
                disabled={isLoading || !chatMessage.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Parse Invoice
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Traditional Form with AI Enhancements */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Description Field with AI Generation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Description
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={generateDescription}
                disabled={isLoading}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Wand2 className="h-4 w-4" />
                AI Generate
              </button>
              <button
                type="button"
                onClick={getSuggestedPricing}
                disabled={isLoading}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
              >
                <DollarSign className="h-4 w-4" />
                Get Pricing
              </button>
            </div>
          </div>
          <textarea
            {...register('description', { required: true })}
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="Describe the work performed..."
          />
        </div>

        {/* Amount Field with AI Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            {pricingSuggestion && (
              <button
                type="button"
                onClick={applySuggestedPricing}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
              >
                <DollarSign className="h-4 w-4" />
                Use AI Suggestion (${pricingSuggestion.suggestedPrice})
              </button>
            )}
          </div>
          <input
            {...register('amount', { required: true, min: 0 })}
            type="number"
            step="0.01"
            className="w-full p-3 border rounded-lg"
            placeholder="0.00"
          />
          {pricingSuggestion && (
            <p className="mt-1 text-sm text-gray-600">
              AI suggests ${pricingSuggestion.suggestedPrice} - {pricingSuggestion.reasoning}
              (Confidence: {Math.round(pricingSuggestion.confidence * 100)}%)
            </p>
          )}
        </div>

        {/* Items with AI Categorization */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Items
            </label>
            <button
              type="button"
              onClick={categorizeItems}
              disabled={isLoading}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Wand2 className="h-4 w-4" />
              Categorize Items
            </button>
          </div>
          
          {watchedItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <input
                {...register(`items.${index}.description`)}
                placeholder="Item description"
                className="col-span-2 p-2 border rounded"
              />
              <input
                {...register(`items.${index}.quantity`)}
                type="number"
                placeholder="Qty"
                className="p-2 border rounded"
              />
              <input
                {...register(`items.${index}.rate`)}
                type="number"
                step="0.01"
                placeholder="Rate"
                className="p-2 border rounded"
              />
            </div>
          ))}
        </div>

        {/* AI Suggestions Display */}
        {aiSuggestions.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">AI Suggestions</h4>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">{suggestion.content}</span>
                  <span className="text-blue-600">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}