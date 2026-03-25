
import React from 'react';

interface MealRow {
  day: number;
  name: string;
  calories: number;
  fiber: number;
  protein: number;
  carb: number;
}

const MEAL_DATA: MealRow[] = [
  { day: 1, name: 'دجاج مشوي مع خضار مسلوقة وأرز أبيض', calories: 430, fiber: 75, protein: 180, carb: 75 },
  { day: 2, name: 'ستيك تندرلوين مع بطاطا مهروسة وخضار', calories: 460, fiber: 75, protein: 180, carb: 75 },
  { day: 3, name: 'دجاج صيني مع نودلز أرز وخضار', calories: 445, fiber: 75, protein: 180, carb: 75 },
  { day: 4, name: 'دجاج بالكاري والخضار مع أرز أبيض', calories: 455, fiber: 75, protein: 180, carb: 75 },
  { day: 5, name: 'سالمون مشوي مع برغل تركي وخضار', calories: 510, fiber: 75, protein: 180, carb: 75 },
  { day: 6, name: 'ستيك ستروجانوف مع أرز أبيض', calories: 490, fiber: 75, protein: 180, carb: 75 },
  { day: 7, name: 'دجاج بتر ليمون مع خضار وبطاطا مهروسة', calories: 465, fiber: 75, protein: 180, carb: 75 },
  { day: 8, name: 'ستيك جرايفي مع ماش (بطاطا) وخضار', calories: 480, fiber: 75, protein: 180, carb: 75 },
  { day: 9, name: 'سمك مشوي مع خضار وأرز صيادية', calories: 415, fiber: 75, protein: 180, carb: 75 },
  { day: 10, name: 'فيليه هامور مشوي مع خضار سوتيه', calories: 395, fiber: 75, protein: 180, carb: 75 },
  { day: 11, name: 'دجاج مسالا مع أرز أبيض', calories: 470, fiber: 75, protein: 180, carb: 75 },
  { day: 12, name: 'دجاج ألفريدو مع أرز أبيض', calories: 485, fiber: 75, protein: 180, carb: 75 },
  { day: 13, name: 'سمك بالليمون والثوم مع بطاطا مهروسة', calories: 410, fiber: 75, protein: 180, carb: 75 },
  { day: 14, name: 'دجاج مع بيستو وأرز أبيض', calories: 495, fiber: 75, protein: 180, carb: 75 },
  { day: 15, name: 'ستيك آسيوي مع خضار مشكلة', calories: 450, fiber: 75, protein: 180, carb: 75 },
  { day: 16, name: 'دجاج بالفلفل الأسود مع فلفل بارد وأرز أبيض', calories: 440, fiber: 75, protein: 180, carb: 75 },
  { day: 17, name: 'فيليه سمك بالفرن بصلصة الطحينية وأرز أبيض', calories: 460, fiber: 75, protein: 180, carb: 75 },
  { day: 18, name: 'ستيك ترياكي مع بروكلي وجزر وأرز أبيض', calories: 475, fiber: 75, protein: 180, carb: 75 },
  { day: 19, name: 'دجاج بالزعتر والليمون مع بطاطا مشوية وخضار', calories: 435, fiber: 75, protein: 180, carb: 75 },
  { day: 20, name: 'سالمون بصلصة الترياكي مع خضار وأرز أبيض', calories: 525, fiber: 75, protein: 180, carb: 75 },
  { day: 21, name: 'ستيك بالصلصة المكسيكية مع أرز أحمر', calories: 470, fiber: 75, protein: 180, carb: 75 },
  { day: 22, name: 'دجاج متبل بالأعشاب مع كينوا وخضار', calories: 450, fiber: 75, protein: 180, carb: 75 },
  { day: 23, name: 'سمك فيليه بصلصة الكزبرة مع بطاطا مهروسة', calories: 410, fiber: 75, protein: 180, carb: 75 },
  { day: 24, name: 'دجاج مشوي باربيكيو مع بطاطا ودجز وخضار', calories: 455, fiber: 75, protein: 180, carb: 75 },
];

export const MealTable: React.FC = () => {
  return (
    <div className="mt-16 mb-12 animate-fade-in">
      <div className="bg-uh-dark text-white p-6 rounded-t-3xl flex justify-between items-center">
        <h2 className="text-3xl font-brand">جدول الوجبات</h2>
        <img src="https://i.ibb.co/nqmV5jzX/23.png" alt="Uncle Healthy" className="h-12 bg-white rounded p-1" />
      </div>
      
      <div className="overflow-x-auto shadow-2xl rounded-b-3xl">
        <table className="w-full text-right border-collapse bg-[#4a5d23] text-white">
          <thead className="bg-[#3a4a1a] text-uh-gold">
            <tr>
              <th className="p-4 border border-white/20">اليوم</th>
              <th className="p-4 border border-white/20">اسم الوجبة</th>
              <th className="p-4 border border-white/20">السعرات الحرارية</th>
              <th className="p-4 border border-white/20">الالياف (خضار)</th>
              <th className="p-4 border border-white/20">البروتين</th>
              <th className="p-4 border border-white/20">الكارب</th>
            </tr>
          </thead>
          <tbody>
            {MEAL_DATA.map((meal) => (
              <tr key={meal.day} className="hover:bg-white/10 transition-colors">
                <td className="p-3 border border-white/10 text-center font-bold">{meal.day}</td>
                <td className="p-3 border border-white/10">{meal.name}</td>
                <td className="p-3 border border-white/10 text-center">{meal.calories}</td>
                <td className="p-3 border border-white/10 text-center">{meal.fiber}</td>
                <td className="p-3 border border-white/10 text-center">{meal.protein}</td>
                <td className="p-3 border border-white/10 text-center">{meal.carb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-uh-dark font-bold px-4">
        <p dir="ltr">+962 788 07 8118</p>
        <p dir="ltr">WWW.UNCLEHEALTHY.COM</p>
      </div>
    </div>
  );
};
