
import React, { useState } from 'react';
import { UserProfile, DailyPlan } from '../types';
import { INITIAL_USER_PROFILE } from '../constants';
import { MessageSquare, FileText, Send, User, ChevronLeft, Lock } from 'lucide-react';
import { generateWeeklyPlan } from '../services/aiService';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<'SELECT' | 'AI' | 'FORM' | 'PASSWORD'>('SELECT');
  const [formData, setFormData] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  


  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if phone number is already registered
    setIsGenerating(true);
    try {
        const exists = await authService.checkPhoneExists(formData.phone);
        if (exists) {
            alert("رقم الهاتف هذا مسجل بالفعل. يرجى تسجيل الدخول أو استخدام رقم آخر.");
            return;
        }
        setMode('PASSWORD'); // Move to password step
    } catch (error) {
        console.error("Error checking phone existence", error);
        // If check fails, we might decide to let them proceed or block. 
        // Safer to let them proceed but they'll hit the 'create' rule later.
        setMode('PASSWORD');
    } finally {
        setIsGenerating(false);
    }
  };



  const handleFinalRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("كلمات المرور غير متطابقة");
        return;
    }
    if (password.length < 6) {
        alert("كلمة المرور يجب أن تكون 6 خانات على الأقل");
        return;
    }

    setIsGenerating(true);
    try {
        // 1. Generate Plan One Time
        const plan = await generateWeeklyPlan(formData);
        
        // 2. Prepare Complete User Object
        const finalProfile: UserProfile = {
            ...formData,
            id: formData.phone,
            password: password,
            hasProfile: true,
            savedPlan: plan
        };

        // 3. Persist to DB (Async now)
        await authService.register(finalProfile);

        // 4. Complete
        onComplete(finalProfile);
    } catch (error: any) {
        console.error("Registration failed", error);
        alert(error.message || "حدث خطأ أثناء إنشاء الحساب. قد يكون رقم الهاتف مستخدماً بالفعل.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (mode === 'SELECT') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-fade-in">
        <h2 className="text-3xl font-brand text-uh-dark">ابدأ رحلتك الصحية معنا</h2>
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => setMode('FORM')}
            className="w-full p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition border-2 border-transparent hover:border-uh-green group"
          >
            <FileText size={48} className="mx-auto mb-4 text-uh-green group-hover:scale-110 transition" />
            <h3 className="text-xl font-bold mb-2">تعبئة بيانات الملف الصحي</h3>
            <p className="text-gray-500 text-sm">نموذج سريع ومباشر لإدخال بياناتك وبناء خطتك</p>
          </button>
        </div>
      </div>
    );
  }



  if (mode === 'PASSWORD') {
      return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-uh-dark mb-4">حماية حسابك</h2>
            <p className="text-gray-500 mb-6">يرجى تعيين كلمة مرور لتمكينك من الدخول لملفك الصحي لاحقاً.</p>
            
            <form onSubmit={handleFinalRegistration} className="space-y-4">
                <div className="text-right">
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                    <div className="relative">
                        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg p-3 pr-10" />
                        <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>
                <div className="text-right">
                    <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border rounded-lg p-3 pr-10" />
                        <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>
                </div>
                
                <button type="submit" disabled={isGenerating} className="w-full bg-uh-green text-white font-bold py-4 rounded-lg hover:bg-uh-greenDark transition shadow-md mt-4 flex justify-center items-center gap-2">
                    {isGenerating ? 'جاري إعداد خطتك...' : 'إنشاء الحساب وبدء الرحلة'}
                    {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                </button>
            </form>
        </div>
      )
  }

  // Form Mode
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setMode('SELECT')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold text-uh-dark">إنشاء ملف صحي</h2>
      </div>
      
      <form onSubmit={handleFormSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" placeholder="مثال: أحمد محمد" />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
            <input required name="age" type="number" value={formData.age} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none">
                <option value="">اختر...</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الطول (سم)</label>
            <input required name="height" type="number" value={formData.height} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوزن (كغ)</label>
            <input required name="weight" type="number" value={formData.weight} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" />
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">الهدف الصحي</label>
            <select name="goal" value={formData.goal} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none">
                <option value="">اختر...</option>
                <option value="تخفيف وزن">تخفيف الوزن</option>
                <option value="زيادة وزن">زيادة الوزن</option>
                <option value="بناء عضلات">بناء كتلة عضلية</option>
                <option value="حياة صحية">المحافظة على نمط حياة صحي</option>
            </select>
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">هل لديك حساسية من أطعمة معينة؟</label>
            <input name="allergies" value={formData.allergies} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" placeholder="مثال: مكسرات، غلوتين... (اتركه فارغاً إذا لا يوجد)" />
        </div>

        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input required name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-uh-green outline-none" placeholder="079xxxxxxx" />
        </div>

        <div className="col-span-2 pt-4">
            <button type="submit" className="w-full bg-uh-green text-white font-bold py-4 rounded-lg hover:bg-uh-greenDark transition shadow-md">
                التالي: إعداد كلمة المرور
            </button>
        </div>
      </form>
    </div>
  );
};