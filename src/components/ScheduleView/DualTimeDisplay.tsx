import React, { useState } from 'react';
import { Globe, ArrowLeftRight, Clock, User } from 'lucide-react';
import { Student, TeacherSettings } from '../../types';
import { convertTeacherTimeToStudentTime, formatTime12 } from '../../utils/timezones';

interface DualTimeDisplayProps {
  students: Student[];
  settings: TeacherSettings;
}

export const DualTimeDisplay: React.FC<DualTimeDisplayProps> = ({
  students,
  settings,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [testTime, setTestTime] = useState<string>('16:00');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const conversion = selectedStudent
    ? convertTeacherTimeToStudentTime(
        testTime,
        settings.teacherTimeZone,
        selectedStudent.timezone
      )
    : null;

  return (
    <div className="bg-gradient-to-br from-[#3D4D40] to-[#2B382D] text-[#FDFBF7] rounded-2xl p-5 shadow-md border border-[#526655]/60">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#526655]/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#4A5D4E]/80 text-[#D8E6DB]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#FDFBF7]">محول فروق التوقيت المباشر</h3>
            <p className="text-xs text-[#C8D7CC]">
              تحويل أي موعد فورياً بين توقيتك ({settings.teacherCountry}) وتوقيت الطالب في بلده
            </p>
          </div>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <User className="w-4 h-4 text-[#A1BEA6] shrink-0" />
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="bg-[#242E25] border border-[#526655] text-[#FDFBF7] text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#82A888] w-full sm:w-auto font-medium"
          >
            {students.map(s => (
              <option key={s.id} value={s.id} className="bg-[#242E25] text-white">
                {s.countryFlag} {s.name} ({s.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Converter Interactive Body */}
      {selectedStudent && conversion && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Teacher side */}
          <div className="bg-[#242E25]/50 backdrop-blur-xs rounded-xl p-3.5 border border-[#526655]/40 text-center">
            <div className="text-xs text-[#B5C8BA] font-medium mb-1">
              توقيتك ({settings.teacherCountry})
            </div>
            <div className="flex items-center justify-center gap-2 my-1">
              <Clock className="w-4 h-4 text-[#82A888]" />
              <input
                type="time"
                value={testTime}
                onChange={e => setTestTime(e.target.value)}
                className="bg-[#1C241D] text-white text-base font-bold px-2.5 py-1 rounded-lg border border-[#526655] focus:outline-none focus:ring-2 focus:ring-[#82A888] text-center"
              />
            </div>
            <div className="text-xs text-[#A8B9AB] mt-1 font-mono">
              {formatTime12(testTime)}
            </div>
          </div>

          {/* Middle indicator / difference */}
          <div className="flex flex-col items-center justify-center text-center px-2">
            <div className="flex items-center gap-1.5 text-[#E4ECE6] text-xs font-semibold bg-[#4A5D4E]/80 px-3 py-1 rounded-full border border-[#5E7564] mb-1.5 shadow-xs">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>{conversion.offsetDescription}</span>
            </div>
            <span className="text-[11px] text-[#A8B9AB]">
              المنطقة: {selectedStudent.timezone.split('/')[1] || selectedStudent.timezone}
            </span>
          </div>

          {/* Student side */}
          <div className="bg-[#242E25]/50 backdrop-blur-xs rounded-xl p-3.5 border border-[#526655]/40 text-center">
            <div className="text-xs text-[#B5C8BA] font-medium mb-1">
              توقيت الطالب ({selectedStudent.country} {selectedStudent.countryFlag})
            </div>
            <div className="text-xl font-extrabold text-[#E8C59A] font-mono my-1 tracking-wide">
              {conversion.studentTime12}
            </div>
            <div className="text-xs text-[#A8B9AB] font-mono">
              ({conversion.studentTime24} بتوقيت 24 ساعة)
              {conversion.dayOffset !== 0 && (
                <span className="block text-[#E8C59A] font-bold text-[10px] mt-0.5">
                  {conversion.dayOffset > 0 ? '⚠️ في اليوم التالي عند الطالب' : '⚠️ في اليوم السابق عند الطالب'}
                </span>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
