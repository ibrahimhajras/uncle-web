
import { Meal, UserProfile, DailyPlan } from '../types';
import { MEALS, PLANS } from '../constants';
import { dataService } from './dataService';

/**
 * AI Service using Groq for public FAQ and website assistance.
 */

// Function to generate a static weekly plan (formerly AI-powered)
// As per user request, AI is now restricted to FAQ only.
export const generateWeeklyPlan = async (user: UserProfile): Promise<DailyPlan[]> => {
  const currentMeals = await dataService.getMeals();
  
  // Return a balanced static plan based on available meals
  return Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    breakfast: currentMeals.find(m => m.id === 'm4') || currentMeals[0],
    lunch: currentMeals.find(m => m.id === 'm1') || currentMeals[1],
    dinner: currentMeals.find(m => m.id === 'm2') || currentMeals[2]
  }));
};

export const chatWithAI = async (history: {role: 'user' | 'model', text: string}[], newMessage: string) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.warn("Groq API Key is missing.");
        return "عذراً، خدمة المساعد الذكي غير مفعلة حالياً.";
    }

    try {
        const [currentMeals, currentPlans, content] = await Promise.all([
            dataService.getMeals().catch(() => []),
            dataService.getSubscriptionPlans().catch(() => []),
            dataService.getContent().catch(() => ({ missionText: '', featuresList: [], contactPhone: '' }))
        ]);

        const menuContext = currentMeals.length > 0 
            ? currentMeals.map(m => `- ${m.name}: ${m.description} (${m.macros.calories} Cal). Price: ${m.price}`).join('\n')
            : "No meals currently listed.";

        const plansContext = currentPlans.length > 0
            ? currentPlans.map(p => `- ${p.title}: ${p.features.join(', ')}. Price: ${p.price} JOD`).join('\n')
            : "No plans currently listed.";

        const systemInstruction = `
      أنت المساعد الذكي الرسمي لموقع "Uncle Healthy" (انكل هيلثي).
      مهمتك الوحيدة هي الإجابة على أسئلة المستخدمين حول الموقع، الوجبات، الاشتراكات، والخدمات المتاحة لدينا فقط.
      
      معلومات الموقع:
      - المهمة: ${content.missionText}
      - المميزات: ${content.featuresList?.join('، ')}
      - الهاتف: ${content.contactPhone}
      
      قائمة الوجبات المتوفرة:
      ${menuContext}
      
      باقات الاشتراك:
      ${plansContext}

      القواعد والقيود:
      1. أجب باللغة العربية بأسلوب ودود ومحترف.
      2. لا تقدم نصائح طبية أو رياضية عامة خارج حدود وجباتنا.
      3. إذا سألك المستخدم عن مواضيع غير متعلقة بـ Uncle Healthy (مثل وصفات طبخ خارجية، أخبار، معلومات عامة)، اعتذر بوضوح وقل أنك مخصص لمساعدة عملاء Uncle Healthy فقط.
      4. لا تقم بتحليل بيانات طبية للمستخدم أو تصميم جداول غذائية معقدة؛ وجههم للاشتراك في باقاتنا للحصول على متابعة.
      5. حافظ على إجابات مختصرة ومفيدة.
    `;


        console.log("Calling Groq with message:", newMessage);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemInstruction },
                    ...history.map(m => ({
                        role: m.role === 'model' ? 'assistant' : 'user',
                        content: m.text
                    })),
                    { role: 'user', content: newMessage }
                ],
                temperature: 0.7,
                max_tokens: 512
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Groq Response Error:", response.status, errBody);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            console.error("Malformed Groq Data:", data);
            return "عذراً، لم أستطع معالجة الإجابة.";
        }
    } catch (error) {
        console.error("Full AI Service Error:", error);
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
            return "عذراً، لا يمكن الاتصال بالذكاء الاصطناعي مباشرة من المتصفح. قد يكون ذلك بسبب قيود الأمان (CORS).";
        }
        return "عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي.";
    }
};
