// =====================================================================
// Domain types for the counseling data entry system
// =====================================================================

export type VisitType = 'pre_marriage' | 'children' | 'pregnancy' | 'family_planning';

export const VISIT_TYPES: VisitType[] = [
  'pre_marriage',
  'children',
  'pregnancy',
  'family_planning',
];

export const VISIT_TYPE_LABEL: Record<VisitType, string> = {
  pre_marriage: 'مشورة ما قبل الزواج',
  children: 'سجل المشورة للأطفال',
  pregnancy: 'المشورة الأسرية للحامل',
  family_planning: 'المشورة الأسرية لتنظيم الأسرة',
};

export const VISIT_TYPE_SHORT: Record<VisitType, string> = {
  pre_marriage: 'ما قبل الزواج',
  children: 'الأطفال',
  pregnancy: 'حامل',
  family_planning: 'تنظيم الأسرة',
};

// Field types used by the renderer & DB payload
export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'phone'
  | 'national_id'
  | 'boolean';

export interface FieldDef {
  key: string;             // JSON key stored inside `data`
  label: string;           // Arabic label
  hint?: string;           // Helper text shown under the input
  type: FieldType;
  options?: string[];      // For 'select' fields
  section?: string;        // Grouping key for the section divider
  required?: boolean;
  span?: 1 | 3;          // Visual width (1 full row, 3 = 1/3 width)
}

export interface FormSchema {
  type: VisitType;
  title: string;
  sections: { id: string; title: string }[];
  fields: FieldDef[];
}

// =====================================================================
// SCHEMA: مشورة ما قبل الزواج  (Pre-marriage)
// =====================================================================
export const PRE_MARRIAGE_SCHEMA: FormSchema = {
  type: 'pre_marriage',
  title: 'سجل مشورة ما قبل الزواج',
  sections: [
    { id: 'first_meeting', title: 'بيانات اللقاء الأول' },
    { id: 'partner_male',   title: 'بيانات الشريك' },
    { id: 'partner_female', title: 'بيانات الشريكة' },
    { id: 'background',     title: 'الخلفية الطبية والاجتماعية' },
    { id: 'session',        title: 'بيانات اللقاء' },
    { id: 'topics',         title: 'الموضوعات التي تم تناولها' },
  ],
  fields: [
    // Partner 1 (male in row 4) — kept as “الشريك” per Excel
    { key: 'partner_name',            label: 'اسم الشريك',          type: 'text',        hint: 'الاسم ثلاثي على الأقل',    section: 'partner_male', span: 3 },
    { key: 'partner_age',             label: 'السن',                type: 'number',      hint: 'بالسنوات',                  section: 'partner_male' },
    { key: 'partner_education',       label: 'مستوى التعليم',       type: 'select',      hint: 'اختر من القائمة',           section: 'partner_male',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي','مؤهل عالي'] },
    { key: 'partner_job',             label: 'الوظيفة',             type: 'select',      hint: 'اختر من القائمة',           section: 'partner_male',
      options: ['يعمل','لا يعمل'] },
    { key: 'partner_national_id',     label: 'الرقم القومي',        type: 'national_id', hint: 'تأكد من كتابة 14 رقم',     section: 'partner_male', span: 3 },
    { key: 'partner_phone',           label: 'رقم الموبايل',        type: 'phone',       hint: 'تأكد من كتابة 11 رقم',     section: 'partner_male' },

    // Partner 2 (female)
    { key: 'spouse_name',             label: 'اسم الشريكة',         type: 'text',        hint: 'الاسم ثلاثي على الأقل',    section: 'partner_female', span: 3 },
    { key: 'spouse_age',              label: 'السن',                type: 'number',      hint: 'بالسنوات',                  section: 'partner_female' },
    { key: 'spouse_education',        label: 'مستوى التعليم',       type: 'select',      hint: 'اختر من القائمة',           section: 'partner_female',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'spouse_job',              label: 'الوظيفة',             type: 'select',      hint: 'اختر من القائمة',           section: 'partner_female',
      options: ['يعمل','لا تعمل'] },
    { key: 'spouse_national_id',      label: 'الرقم القومي',        type: 'national_id', hint: 'تأكد من كتابة 14 رقم',     section: 'partner_female', span: 3 },
    { key: 'spouse_phone',            label: 'رقم الموبايل',        type: 'phone',       hint: 'تأكد من كتابة 11 رقم',     section: 'partner_female' },

    // Background
    { key: 'kinship',                 label: 'صلة قرابة بين الشريكين',                type: 'select', hint: 'اختر من القائمة', section: 'background',
      options: ['لا يوجد','من الدرجة الأولى','من الدرجة الثانية','من الدرجة الثالثة','من الدرجة الرابعة','من الدرجة الخامسة'] },
    { key: 'chronic_disease',         label: 'إصابة أي من الشريكين بأمراض مزمنة',    type: 'select', hint: 'اختر من القائمة', section: 'background',
      options: ['لا يوجد','أمراض القلب والأوعية الدموية','الضغط','أمراض الجهاز التنفسي','السرطان','السكر','الصرع','الأنيميا','أخرى'] },
    { key: 'family_history',          label: 'تاريخ مرضي لأسرتي الشريكين',           type: 'select', hint: 'اختر من القائمة', section: 'background',
      options: ['لا يوجد','الأمراض الوراثية (الأنيميا المنجلية وبيتا ثلاسيميا)','الأمراض المعدية (التهاب الكبد بي، سي، ونقص المناعة المكتسبة)','بعض أنواع السرطان','السكر','السمنة','الربو','أمراض القلب وجلطات الدم','الزهايمر والخرف','التهاب المفاصل','الاكتئاب','ارتفاع ضغط الدم والدهنيات'] },
    { key: 'independent_housing',     label: 'توافر سكن مستقل',                       type: 'select', hint: 'اختر من القائمة', section: 'background',
      options: ['يوجد','لا يوجد'] },
    { key: 'children_from_previous',  label: 'وجود أطفال لأي من الشريكين من ارتباط سابق', type: 'select', hint: 'اختر من القائمة', section: 'background',
      options: ['يوجد','لا يوجد'] },

    // Session meta
    { key: 'session_number',          label: 'رقم اللقاء',                            type: 'select', hint: 'اختر من القائمة', section: 'session',
      options: ['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر'] },
    { key: 'session_date',            label: 'التاريخ',                               type: 'date',                   section: 'session' },

    // Topics (each row in Excel col AE..BA)
    { key: 'topic_intro_screening',   label: 'التعريف بخدمات الفحص والمشورة وأهميتها', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_partner_choice',    label: 'اختيار شريك الحياة وأهمية التوافق الزوجي', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_pre_marriage_rec',  label: 'توصيات ما قبل الزواج والحمل', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_intimacy',          label: 'آليات التعامل مع شريك الحياة والألفة والعلاقة الحميمية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_family_planning',   label: 'التخطيط الأسري وجوانب القوة والتطوير وبناء قائمة الأمنيات', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_conflict_skills',   label: 'مهارات حل الخلافات والضغوط الشخصية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_finance',           label: 'المعاملات المالية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_family_problems',   label: 'كيفية التعامل مع المشاكل الأسرية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_healthy_lifestyle', label: 'إتباع النمط السليم للحياة الصحية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_repro_health',      label: 'التوعية بالصحة الإنجابية بوجه عام والتخطيط الانجابي', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_diabetes',          label: 'الإرشادات في حالة الإصابة بمرض السكري', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_hypertension',      label: 'الإرشادات في حالة الإصابة بارتفاع ضغط الدم', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_psych_pressure',    label: 'التعامل مع الضغوط النفسية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_female_psych',      label: 'الاضطرابات النفسية التي قد تصيب المرأة', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_hepatitis_c',       label: 'الإرشادات في حالة الإصابة بفيروس الالتهاب الكبدي سي', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_hepatitis_b',       label: 'الإرشادات في حالة الإصابة بفيروس الالتهاب الكبدي ب', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_hiv',               label: 'الإرشادات في حالة الإصابة بفيروس نقص المناعة البشري', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_rhesus',            label: 'معرفة عامل ريسس', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_genetic_counsel',   label: 'المشورة الوراثية للأقارب', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_parenthood',        label: 'الاستعداد للوالدية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_natural_birth',     label: 'أهمية الولادة الطبيعية وتجنب القيصرية غير الضرورية', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_birth_spacing',     label: 'أهمية المباعدة بين الولادات', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_other',             label: 'موضوعات أخرى (اذكر الموضوعات)', type: 'textarea', section: 'topics', span: 1 },
  ],
};

// =====================================================================
// SCHEMA: سجل المشورة للأطفال  (Children counseling)
// =====================================================================
export const CHILDREN_SCHEMA: FormSchema = {
  type: 'children',
  title: 'سجل المشورة للأطفال',
  sections: [
    { id: 'mother',  title: 'بيانات الأم' },
    { id: 'father',  title: 'بيانات الأب' },
    { id: 'child',   title: 'بيانات الطفل' },
    { id: 'session', title: 'بيانات الزيارة' },
    { id: 'feeding',title: 'الرضاعة الحالية' },
    { id: 'growth',  title: 'قياسات النمو' },
    { id: 'topics',  title: 'الموضوعات التي تم تناولها' },
    { id: 'closing', title: 'التخطيط والملاحظات' },
  ],
  fields: [
    // Mother
    { key: 'mother_name',           label: 'اسم الأم',                          type: 'text',        hint: 'الاسم ثلاثي على الأقل', section: 'mother', span: 3 },
    { key: 'mother_national_id',    label: 'الرقم القومي للأم',                type: 'national_id', hint: 'تأكد من كتابة 14 رقم', section: 'mother', span: 3 },
    { key: 'mother_phone',          label: 'رقم الموبايل للأم',                 type: 'phone',       hint: 'تأكد من كتابة 11 رقم', section: 'mother' },
    { key: 'mother_birth_date',     label: 'تاريخ ميلاد الأم',                  type: 'date',                       section: 'mother' },
    { key: 'mother_education',      label: 'مستوى التعليم للأم',                type: 'select',      hint: 'اختر من القائمة', section: 'mother',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'mother_children_count', label: 'عدد الأطفال لدى الأم',             type: 'number',      hint: 'بالأرقام', section: 'mother' },
    { key: 'mother_last_gap',       label: 'المدة بين آخر حملين',              type: 'number',      hint: 'بالشهور', section: 'mother' },
    { key: 'mother_job',            label: 'الوظيفة',                           type: 'select',      hint: 'اختر من القائمة', section: 'mother',
      options: ['يعمل','لا يعمل'] },

    // Father
    { key: 'father_national_id',    label: 'الرقم القومي للأب',                type: 'national_id', hint: 'تأكد من كتابة 14 رقم', section: 'father', span: 3 },
    { key: 'father_phone',          label: 'رقم الموبايل للأب',                 type: 'phone',       hint: 'تأكد من كتابة 11 رقم', section: 'father' },
    { key: 'father_name',           label: 'اسم الأب',                          type: 'text',        hint: 'الاسم ثلاثي على الأقل', section: 'father', span: 3 },
    { key: 'father_education',      label: 'مستوى التعليم للأب',                type: 'select',      hint: 'اختر من القائمة', section: 'father',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },

    // Child
    { key: 'child_name',            label: 'اسم الطفل',                         type: 'text',                       section: 'child', span: 3 },
    { key: 'child_birth_date',      label: 'تاريخ الميلاد',                     type: 'date',                       section: 'child' },
    { key: 'child_age_months',      label: 'العمر الحالي للطفل',                type: 'number',      hint: 'بالشهور',  section: 'child' },
    { key: 'child_gestational_age', label: 'العمر الرحمي للطفل',               type: 'number',      hint: 'بالاسبوع', section: 'child' },
    { key: 'follow_up_place',       label: 'مكان المتابعة',                     type: 'select', hint: 'اختر',  section: 'child',
      options: ['وحدة','مستشفى','اخري'] },
    { key: 'referral_source',       label: 'مصدر الإحالة',                      type: 'select',                      section: 'child',
      options: ['مستشفى الولادة','عيادة خاصة','عيادة التطعيمات','نصيحة'] },
    { key: 'delivery_type',         label: 'نوع الولادة',                       type: 'select', hint: 'اختر من القائمة',  section: 'child',
      options: ['طبيعى','قيصرى'] },
    { key: 'delivery_place',        label: 'مكان الولادة',                      type: 'select', hint: 'اختر من القائمة',  section: 'child',
      options: ['المستشفى','المنزل'] },
    { key: 'birth_weight',          label: 'وزن الطفل عند الولادة',             type: 'text',                       section: 'child' },
    { key: 'birth_length',          label: 'طول الطفل عند الولادة',             type: 'text',                       section: 'child' },
    { key: 'birth_head_circ',       label: 'مقاس رأس الطفل عند الولادة',       type: 'text',                       section: 'child' },
    { key: 'nicu_admission',        label: 'دخول الحضانة',                      type: 'select', hint: 'اختر من القائمة',  section: 'child',
      options: ['نعم','لا'] },
    { key: 'nicu_reason',           label: 'سبب دخول الحضانة',                  type: 'select', hint: 'اختر من القائمة',  section: 'child',
      options: [
        'انخفاض وزن الطفل.',
        'احتياج الطفل لأدوية محددة بهذا الوقت.',
        'صعوبة شديدة في التنفس لعدم اكتمال نمو الرئتين.',
        'ارتفاع درجة حرارة جسم الرضيع.',
        'تعطل العمليات الحيوية بجسم الطفل.',
        'انخفاض معدل الجلوكوز في دم الطفل.',
        'معاناة الرضيع مشكلات في الجهاز الهضمي.',
        'إصابة الطفل بعدوى في الدم.',
        'إصابة الطفل بالصفراء.',
        'حدوث مشكلات خلال الولادة (الولادة المتعسرة).',
        'وجود عيب خلقي يمنع الطفل عن التنفس أو الرضاعة.'
      ] },
    { key: 'nicu_duration_days',    label: 'مدة البقاء في الحضانة',             type: 'number', hint: 'بالأيام',  section: 'child' },
    { key: 'skin_to_skin',          label: 'ملامسة الجلد في الساعة الذهبية الأولى', type: 'select', options: ['نعم','لا'], section: 'child' },
    { key: 'bf_golden_hour',        label: 'الرضاعة الطبيعية في الساعة الذهبية الأولى', type: 'select', options: ['نعم','لا'], section: 'child' },

    // Session
    { key: 'session_number',        label: 'موعد الزيارة',                      type: 'select', hint: 'اختر من القائمة', section: 'session',
      options: ['الأسبوع الأول','عمر شهر','عمر شهرين','عمر 3 شهور','عمر 4 شهور','عمر 6 شهور','عمر 9 شهور','عمر 12 شهر','عمر 18 شهر','عمر سنتين','عمر 3 سنوات'] },
    { key: 'session_date',          label: 'تاريخ الزيارة',                     type: 'date',  section: 'session' },

    // Feeding
    { key: 'feeding_type',          label: 'الموعد الحالي بشأن الرضاعة',        type: 'select', section: 'feeding',
      options: ['رضاعة طبيعية مطلقة','رضاعة طبيعية مع سوائل وأعشاب','رضاعة طبيعية مع صناعي','رضاعة لبن صناعي'] },
    { key: 'feeding_duration',      label: 'مدة الرضاعة الطبيعية المطلقة',      type: 'select', section: 'feeding',
      options: ['3 شهور','4 شهور','6 شهور'] },

    // Growth
    { key: 'weight_kg',             label: 'الوزن',                             type: 'number', hint: 'بالكيلوجرام',  section: 'growth' },
    { key: 'length_cm',             label: 'الطول',                             type: 'number', hint: 'بالسنتيمتر',    section: 'growth' },
    { key: 'head_circumference_cm', label: 'محيط الرأس',                       type: 'number', hint: 'بالسنتيمتر',    section: 'growth' },

    // Topics
    { key: 'topic_bf_basics',           label: 'فوائد الرضاعة الطبيعية والأوضاع وعلامات الجوع والشبع', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_milk_amount',         label: 'كفاية اللبن وكمية البراز',                              type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_vitamin_d',           label: 'إعطاء الجرعة اليومية من فيتامين د',                    type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_cord_care',           label: 'كيفية رعاية السرة والاهتمام بنظافة الطفل',            type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_health_card',         label: 'البطاقة الصحية وأهمية المتابعة الدورية ومنحنيات النمو', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_vaccination',         label: 'أهمية الالتزام بتطعيمات الطفل',                       type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_mother_nutrition',    label: 'التغذية الصحية للأم المرضعة',                         type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_danger_signs',        label: 'كيفية التعرف على علامات الخطورة',                    type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_growth_motor',        label: 'الرسائل الصحية - النمو والتطور الحركي',               type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_growth_cognitive',    label: 'الرسائل الصحية - التطور الإدراكي والمعرفي',         type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_growth_language',     label: 'الرسائل الصحية - التطور اللغوي',                     type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_positive_parenting',  label: 'رسائل التربية الإيجابية',                           type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_stimulating',         label: 'الأنشطة التحفيزية',                                  type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_complementary',       label: 'التوعية عن التغذية التكميلية وسلامة الغذاء',         type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_iron_dose',           label: 'إعطاء الجرعة اليومية من الحديد',                     type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_fp_use',              label: 'أهمية استخدام وسيلة تنظيم أسرة وأهمية المباعدة',   type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'fp_attitude',               label: 'موقف استخدام وسيلة تنظيم أسرة',                    type: 'select', hint: 'اختر من القائمة', section: 'topics',
      options: ['توجد','لا يوجد','وسؤال الحمل الجديد','مرغوب','غير مرغوب','حدث','لم يحدث'] },
    { key: 'new_pregnancy',             label: 'الحمل الجديد',                                       type: 'select', section: 'topics',
      options: ['مرغوب','غير مرغوب','وسؤال الخدمات غير الملباة'] },
    { key: 'unmet_services',            label: 'الخدمات غير ملباة',                                 type: 'select', section: 'topics',
      options: ['تم','لم يتم'] },

    // Closing
    { key: 'notes',                    label: 'ملاحظات / توصيات',                                   type: 'textarea', section: 'closing', span: 1 },
    { key: 'next_visit_plan',          label: 'تخطيط الزيارة القادمة',                              type: 'textarea', section: 'closing', span: 1 },
  ],
};

// =====================================================================
// SCHEMA: المشورة الأسرية للحامل  (Pregnancy)
// =====================================================================
export const PREGNANCY_SCHEMA: FormSchema = {
  type: 'pregnancy',
  title: 'المشورة الأسرية للحامل',
  sections: [
    { id: 'client',      title: 'بيانات الحالة' },
    { id: 'background',  title: 'الخلفية الصحية والاجتماعية' },
    { id: 'pregnancy',   title: 'تاريخ الحمل' },
    { id: 'supplements', title: 'المكملات الغذائية' },
    { id: 'fp_history',  title: 'تاريخ وسيلة تنظيم الأسرة' },
    { id: 'session',     title: 'بيانات الزيارة' },
    { id: 'topics',      title: 'الموضوعات التي تم تناولها' },
    { id: 'closing',     title: 'التخطيط والملاحظات' },
  ],
  fields: [
    // Client
    { key: 'client_name',           label: 'الاسم',                          type: 'text',        hint: 'الاسم ثلاثي على الأقل', section: 'client', span: 3 },
    { key: 'client_address',         label: 'العنوان',                         type: 'text',                       section: 'client', span: 3 },
    { key: 'client_national_id',     label: 'الرقم القومي',                    type: 'national_id', hint: 'تأكد من كتابة 14 رقم', section: 'client', span: 3 },
    { key: 'client_phone',           label: 'رقم الموبايل',                    type: 'phone',       hint: 'تأكد من كتابة 11 رقم', section: 'client' },
    { key: 'client_age',             label: 'العمر الحالي',                    type: 'number',      hint: 'بالسنوات', section: 'client' },
    { key: 'age_at_marriage',        label: 'السن عند الزواج',                 type: 'number',      hint: 'بالسنوات', section: 'client' },
    { key: 'age_at_first_pregnancy', label: 'السن عند الحمل الأول',           type: 'number',      hint: 'بالسنوات', section: 'client' },
    { key: 'client_education',       label: 'مستوى التعليم',                   type: 'select',      hint: 'اختر من القائمة', section: 'client',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'client_job',             label: 'الوظيفة',                         type: 'select',      hint: 'اختر من القائمة', section: 'client',
      options: ['يعمل','لا تعمل'] },
    { key: 'last_menstrual_date',    label: 'تاريخ آخر دورة شهرية',          type: 'date',                       section: 'client' },

    // Background
    { key: 'spouse_kinship',         label: 'قرابة بين الزوجين',              type: 'select',      hint: 'اختر من القائمة', section: 'background',
      options: ['لا يوجد','من الدرجة الأولى','من الدرجة الثانية','من الدرجة الثالثة','من الدرجة الرابعة','من الدرجة الخامسة'] },
    { key: 'pregnancy_count',        label: 'عدد مرات الحمل',                  type: 'number',      hint: 'بالأرقام', section: 'background' },
    { key: 'miscarriage_count',      label: 'عدد مرات الإجهاض',               type: 'number',      hint: 'بالأرقام', section: 'background' },
    { key: 'children_count',         label: 'عدد الأطفال',                     type: 'number',      hint: 'بالأرقام', section: 'background' },
    { key: 'last_pregnancy_gap',     label: 'المدة بين آخر حملين',            type: 'number',      hint: 'بالشهور', section: 'background' },
    { key: 'previous_delivery_type', label: 'نوع الولادة السابقة',             type: 'select',      hint: 'اختر من القائمة', section: 'background',
      options: ['طبيعى','قيصرى'] },
    { key: 'chronic_hypertension',   label: 'إرتفاع ضغط الدم',                type: 'select',      hint: 'اختر من القائمة', section: 'background', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_diabetes',       label: 'السكر',                            type: 'select',      hint: 'اختر من القائمة', section: 'background', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_thyroid',        label: 'اضطرابات الغدة',                  type: 'select',      hint: 'اختر من القائمة', section: 'background', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_anemia',         label: 'الأنيميا',                         type: 'select',      hint: 'اختر من القائمة', section: 'background', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_other',          label: 'أمراض مزمنة أخرى',                type: 'text',        hint: 'تذكر', section: 'chronic' },

    // Supplements before pregnancy
    { key: 'supp_before_folic',      label: 'حمض الفوليك (قبل الحمل)',         type: 'select', options: ['يوجد','لا يوجد'], section: 'supplements' },
    { key: 'supp_before_iron',       label: 'الحديد (قبل الحمل)',              type: 'select', options: ['يوجد','لا يوجد'], section: 'supplements' },
    { key: 'supp_before_calcium',    label: 'الكالسيوم (قبل الحمل)',           type: 'select', options: ['يوجد','لا يوجد'], section: 'supplements' },
    // Supplements during pregnancy
    { key: 'supp_during_folic',      label: 'حمض الفوليك (أثناء الحمل)',       type: 'select', options: ['يوجد','لا يوجد'], section: 'supplements' },
    { key: 'supp_during_iron',       label: 'الحديد (أثناء الحمل)',            type: 'select', options: ['يوجد','لا يوجد'], section: 'supplements' },
    { key: 'supp_during_calcium',    label: 'الكالسيوم (أثناء الحمل)',         type: 'select', options: ['يوجد','لا يوجد'], section: 'supplements' },

    // Family planning history
    { key: 'previous_fp_method',     label: 'وسيلة تنظيم الأسرة المستخدمة سابقاً', type: 'select', hint: 'اختر من القائمة', section: 'fp_history',
      options: ['لا يوجد','اقراص','حقن','كبسولات','لولب','طرق طبيعية'] },
    { key: 'previous_fp_duration',   label: 'مدة استخدام الوسيلة السابقة',    type: 'text', section: 'fp_history' },

    // Session
    { key: 'pregnancy_month',        label: 'شهر الحمل',                       type: 'select', hint: 'اختر من القائمة', section: 'session',
      options: ['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع'] },
    { key: 'session_date',           label: 'تاريخ الزيارة',                    type: 'date',    section: 'session' },

    // Topics
    { key: 'topic_nutrition',           label: 'التغذية السليمة',                                       type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_supp',                label: 'المكملات الغذائية',                                      type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_exercise',            label: 'التمارين الرياضية',                                      type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_rest',                label: 'قسط من النوم والراحة',                                  type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_anc',                label: 'المتابعة الدورية للحمل',                                type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_medication_warning',  label: 'التحذير من تناول الأدوية بدون استشارة طبيب والتعرض للتدخين والأبخرة', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_early_discomfort',    label: 'المتاعب البسيطة في الشهور الأولى',                     type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_late_discomfort',     label: 'المتاعب في الشهور الأخيرة',                            type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_danger_signs',        label: 'علامات الخطر أثناء الحمل',                             type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_preterm',             label: 'مشاكل الولادة المبكرة وكيفية تجنبها',                 type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_fetal_movement',      label: 'حركة الجنين / معرفة جنس الجنين / تمييز الأصوات من قبل الجنين', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_breast_changes',      label: 'تغير لون الجلد حول الحلمة وظهور بعض إفرازات من الثدي', type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_clothes',             label: 'ارتداء الملابس الفضفاضة المريحة',                       type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_birth_prep',          label: 'الاستعداد للولادة / تحضير ملابس المولود',               type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_birth_signs',         label: 'علامات الولادة',                                        type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_natural_birth',       label: 'مميزات الولادة الطبيعية',                              type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_golden_hour',         label: 'الساعة الذهبية الأولى',                                type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_skin_to_skin',        label: 'ملامسة الجلد للجلد',                                    type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_early_bf',            label: 'البداية المبكرة للرضاعة الطبيعية',                      type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_exclusive_bf',        label: 'الرضاعة الطبيعية المطلقة',                             type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_spacing',             label: 'أهمية المباعدة',                                         type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_fp_methods',          label: 'وسائل تنظيم الأسرة',                                    type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_fp_after_birth',      label: 'استخدام وسيلة بعد الولادة مباشرة',                     type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_neuro_dev',           label: 'التطور العصبي والنفسي للطفل',                          type: 'select', options: ['تم','لم يتم'], section: 'topics' },

    { key: 'notes',                    label: 'ملاحظات / توصيات',                                     type: 'textarea', section: 'closing', span: 1 },
    { key: 'next_visit_plan',          label: 'تخطيط الزيارة القادمة',                                type: 'textarea', section: 'closing', span: 1 },
    { key: 'postnatal_followup',       label: 'المتابعة ما بعد الولادة',                              type: 'textarea', section: 'closing', span: 1 },
  ],
};

// =====================================================================
// SCHEMA: المشورة الأسرية لتنظيم الأسرة  (Family Planning)
// =====================================================================
export const FAMILY_PLANNING_SCHEMA: FormSchema = {
  type: 'family_planning',
  title: 'المشورة الأسرية لتنظيم الأسرة',
  sections: [
    { id: 'client',     title: 'بيانات الحالة' },
    { id: 'background', title: 'الخلفية الصحية والاجتماعية' },
    { id: 'fp_history', title: 'تاريخ وسيلة تنظيم الأسرة' },
    { id: 'session',    title: 'بيانات الزيارة' },
    { id: 'topics',     title: 'الموضوعات التي تم تناولها' },
    { id: 'closing',    title: 'التخطيط والملاحظات' },
  ],
  fields: [
    // Client (same as pregnancy)
    { key: 'client_name',           label: 'الاسم',                          type: 'text',        hint: 'الاسم ثلاثي على الأقل', section: 'client', span: 3 },
    { key: 'client_address',         label: 'العنوان',                         type: 'text',                       section: 'client', span: 3 },
    { key: 'client_national_id',     label: 'الرقم القومي',                    type: 'national_id', hint: 'تأكد من كتابة 14 رقم', section: 'client', span: 3 },
    { key: 'client_phone',           label: 'رقم الموبايل',                    type: 'phone',       hint: 'تأكد من كتابة 11 رقم', section: 'client' },
    { key: 'client_age',             label: 'العمر الحالي',                    type: 'number',      hint: 'بالسنوات', section: 'client' },
    { key: 'age_at_marriage',        label: 'السن عند الزواج',                 type: 'number',      hint: 'بالسنوات', section: 'client' },
    { key: 'age_at_first_pregnancy', label: 'السن عند الحمل الأول',           type: 'number',      hint: 'بالسنوات', section: 'client' },
    { key: 'client_education',       label: 'مستوى التعليم',                   type: 'select',      hint: 'اختر من القائمة', section: 'client',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'client_job',             label: 'الوظيفة',                         type: 'select',      hint: 'اختر من القائمة', section: 'client',
      options: ['يعمل','لا تعمل'] },
    { key: 'last_menstrual_date',    label: 'تاريخ آخر دورة شهرية',          type: 'date',                       section: 'client' },

    // Background
    { key: 'spouse_kinship',         label: 'قرابة بين الزوجين',              type: 'select',      hint: 'اختر من القائمة', section: 'background',
      options: ['لا يوجد','من الدرجة الأولى','من الدرجة الثانية','من الدرجة الثالثة','من الدرجة الرابعة','من الدرجة الخامسة'] },
    { key: 'pregnancy_count',        label: 'عدد مرات الحمل',                  type: 'number',      hint: 'بالأرقام', section: 'background' },
    { key: 'miscarriage_count',      label: 'عدد مرات الإجهاض',               type: 'number',      hint: 'بالأرقام', section: 'background' },
    { key: 'children_count',         label: 'عدد الأطفال',                     type: 'number',      hint: 'بالأرقام', section: 'background' },
    { key: 'last_pregnancy_gap',     label: 'المدة بين آخر حملين',            type: 'number',      hint: 'بالشهور', section: 'background' },
    { key: 'chronic_hypertension',   label: 'إرتفاع ضغط الدم',                type: 'select', options: ['يوجد','لا يوجد'], section: 'background' },
    { key: 'chronic_diabetes',       label: 'السكر',                            type: 'select', options: ['يوجد','لا يوجد'], section: 'background' },
    { key: 'chronic_thyroid',        label: 'اضطرابات الغدة',                  type: 'select', options: ['يوجد','لا يوجد'], section: 'background' },
    { key: 'chronic_anemia',         label: 'الأنيميا',                         type: 'select', options: ['يوجد','لا يوجد'], section: 'background' },
    { key: 'chronic_other',          label: 'أمراض مزمنة أخرى',                type: 'text',   hint: 'تذكر', section: 'background' },

    // FP history
    { key: 'previous_fp_method',     label: 'وسيلة تنظيم الأسرة المستخدمة سابقاً', type: 'select', hint: 'اختر من القائمة', section: 'fp_history',
      options: ['لا يوجد','اقراص','حقن','كبسولات','لولب','طرق طبيعية'] },
    { key: 'previous_fp_duration',   label: 'مدة استخدام الوسيلة السابقة',    type: 'text', section: 'fp_history' },

    // Session
    { key: 'session_date',           label: 'تاريخ الزيارة',                    type: 'date',    section: 'session' },

    // Topics
    { key: 'topic_spacing',          label: 'أهمية المباعدة',                  type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_fp_methods',       label: 'وسائل تنظيم الأسرة',             type: 'select', options: ['تم','لم يتم'], section: 'topics' },
    { key: 'topic_fp_after_birth',   label: 'استخدام وسيلة بعد الولادة مباشرة', type: 'select', options: ['تم','لم يتم'], section: 'topics' },

    { key: 'notes',                  label: 'ملاحظات / توصيات',                type: 'textarea', section: 'closing', span: 1 },
    { key: 'next_visit_plan',        label: 'تخطيط الزيارة القادمة',           type: 'textarea', section: 'closing', span: 1 },
  ],
};

export const SCHEMAS: Record<VisitType, FormSchema> = {
  pre_marriage: PRE_MARRIAGE_SCHEMA,
  children: CHILDREN_SCHEMA,
  pregnancy: PREGNANCY_SCHEMA,
  family_planning: FAMILY_PLANNING_SCHEMA,
};

// =====================================================================
// Excel export column order — must mirror the original Excel sheet
// =====================================================================
// Order is per the column letters seen in the source file (rows 3-5).
export type ExcelCell = { key: string; label: string; from?: 'client' | 'visit' | 'data' };

export const EXCEL_COLUMNS: Record<VisitType, ExcelCell[]> = {
  pre_marriage: [
    { key: 'row_no',                 label: 'م',                       from: 'visit' },
    { key: 'governorate',            label: 'المحافظة',                from: 'visit' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',        from: 'visit' },
    { key: 'district',               label: 'المنطقة / الادارة',       from: 'visit' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',         from: 'visit' },
    { key: 'health_facility',        label: 'المنشاة الصحية',          from: 'visit' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',         from: 'visit' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',           from: 'visit' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',            from: 'visit' },
    { key: 'first_visit_date',       label: 'تاريخ اول لقاء',          from: 'visit' },
    { key: 'case_number',            label: 'رقم الحالة',              from: 'visit' },
    { key: 'partner_name',           label: 'اسم الشريك',              from: 'data' },
    { key: 'partner_age',            label: 'السن',                    from: 'data' },
    { key: 'partner_education',      label: 'مستوى التعليم',           from: 'data' },
    { key: 'partner_job',            label: 'الوظيفة',                 from: 'data' },
    { key: 'partner_national_id',    label: 'الرقم القومي',            from: 'data' },
    { key: 'partner_phone',          label: 'رقم الموبايل',            from: 'data' },
    { key: 'spouse_name',            label: 'اسم الشريكه',             from: 'data' },
    { key: 'spouse_age',             label: 'السن',                    from: 'data' },
    { key: 'spouse_education',       label: 'مستوى التعليم',           from: 'data' },
    { key: 'spouse_job',             label: 'الوظيفة',                 from: 'data' },
    { key: 'spouse_national_id',     label: 'الرقم القومي',            from: 'data' },
    { key: 'spouse_phone',           label: 'رقم الموبايل',            from: 'data' },
    { key: 'kinship',                label: 'صلة قرابة بين الشريكين',  from: 'data' },
    { key: 'chronic_disease',        label: 'إصابة أي من الشريكين بأمراض مزمنة', from: 'data' },
    { key: 'family_history',         label: 'تاريخ مرضي لأسرتي الشريكين', from: 'data' },
    { key: 'independent_housing',    label: 'توافر سكن مستقل',         from: 'data' },
    { key: 'children_from_previous', label: 'وجود أطفال لأي من الشريكين من ارتباط سابق', from: 'data' },
    { key: 'session_number',         label: 'رقم اللقاء',              from: 'visit' },
    { key: 'session_date',           label: 'التاريخ',                 from: 'visit' },
    { key: 'topic_intro_screening',  label: 'التعريف بخدمات الفحص والمشورة وأهميتها', from: 'data' },
    { key: 'topic_partner_choice',   label: 'اختيار شريك الحياة وأهمية التوافق الزوجي', from: 'data' },
    { key: 'topic_pre_marriage_rec', label: 'توصيات ما قبل الزواج والحمل', from: 'data' },
    { key: 'topic_intimacy',         label: 'آليات التعامل مع شريك الحياة', from: 'data' },
    { key: 'topic_family_planning',  label: 'التخطيط الأسري', from: 'data' },
    { key: 'topic_conflict_skills',  label: 'مهارات حل الخلافات والضغوط الشخصية', from: 'data' },
    { key: 'topic_finance',          label: 'المعاملات المالية', from: 'data' },
    { key: 'topic_family_problems',  label: 'كيفية التعامل مع المشاكل الأسرية', from: 'data' },
    { key: 'topic_healthy_lifestyle',label: 'إتباع النمط السليم للحياة الصحية', from: 'data' },
    { key: 'topic_repro_health',     label: 'التوعية بالصحة الإنجابية', from: 'data' },
    { key: 'topic_diabetes',         label: 'الإرشادات في حالة الإصابة بمرض السكري', from: 'data' },
    { key: 'topic_hypertension',     label: 'الإرشادات في حالة الإصابة بارتفاع ضغط الدم', from: 'data' },
    { key: 'topic_psych_pressure',   label: 'التعامل مع الضغوط النفسية', from: 'data' },
    { key: 'topic_female_psych',     label: 'الاضطرابات النفسية التي قد تصيب المرأة', from: 'data' },
    { key: 'topic_hepatitis_c',      label: 'الإرشادات في حالة الإصابة بفيروس الالتهاب الكبدي سي', from: 'data' },
    { key: 'topic_hepatitis_b',      label: 'الإرشادات في حالة الإصابة بفيروس الالتهاب الكبدي ب', from: 'data' },
    { key: 'topic_hiv',              label: 'الإرشادات في حالة الإصابة بفيروس نقص المناعة البشري', from: 'data' },
    { key: 'topic_rhesus',           label: 'معرفة عامل ريسس', from: 'data' },
    { key: 'topic_genetic_counsel',  label: 'المشورة الوراثية للأقارب', from: 'data' },
    { key: 'topic_parenthood',       label: 'الاستعداد للوالدية', from: 'data' },
    { key: 'topic_natural_birth',    label: 'أهمية الولادة الطبيعية وتجنب القيصرية غير الضرورية', from: 'data' },
    { key: 'topic_birth_spacing',    label: 'أهمية المباعدة بين الولادات', from: 'data' },
    { key: 'topic_other',            label: 'موضوعات أخرى', from: 'data' },
  ],

  children: [
    { key: 'row_no',                 label: 'م',                       from: 'visit' },
    { key: 'governorate',            label: 'المحافظة',                from: 'visit' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',        from: 'visit' },
    { key: 'district',               label: 'المنطقة / الادارة',       from: 'visit' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',         from: 'visit' },
    { key: 'health_facility',        label: 'المنشاة الصحية',          from: 'visit' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',         from: 'visit' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',           from: 'visit' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',            from: 'visit' },
    { key: 'first_visit_date',       label: 'تاريخ اول زيارة',         from: 'visit' },
    { key: 'mother_name',            label: 'اسم الام',                from: 'data' },
    { key: 'mother_national_id',     label: 'الرقم القومي للام',       from: 'data' },
    { key: 'mother_phone',           label: 'رقم الموبايل للام',       from: 'data' },
    { key: 'mother_birth_date',      label: 'تاريخ ميلاد الام',         from: 'data' },
    { key: 'mother_education',       label: 'مستوى التعليم للام',      from: 'data' },
    { key: 'mother_children_count',  label: 'عدد الاطفال لدى الام',    from: 'data' },
    { key: 'mother_last_gap',        label: 'المدة بين اخر حملين',     from: 'data' },
    { key: 'mother_job',             label: 'الوظيفة',                 from: 'data' },
    { key: 'father_national_id',     label: 'الرقم القومي',            from: 'data' },
    { key: 'father_phone',           label: 'رقم الموبايل',            from: 'data' },
    { key: 'father_name',            label: 'اسم الاب',                from: 'data' },
    { key: 'father_education',       label: 'مستوى التعليم للاب',      from: 'data' },
    { key: 'child_name',             label: 'اسم الطفل',               from: 'data' },
    { key: 'child_birth_date',       label: 'تاريخ الميلاد',           from: 'data' },
    { key: 'child_age_months',       label: 'العمر الحالي للطفل',      from: 'data' },
    { key: 'child_gestational_age',  label: 'العمر الرحمي للطفل',      from: 'data' },
    { key: 'follow_up_place',        label: 'مكان المتابعة',           from: 'data' },
    { key: 'referral_source',        label: 'مصدر الاحالة',            from: 'data' },
    { key: 'delivery_type',          label: 'نوع الولادة',             from: 'data' },
    { key: 'delivery_place',         label: 'مكان الولادة',            from: 'data' },
    { key: 'birth_weight',           label: 'وزن الطفل عند الولادة',   from: 'data' },
    { key: 'birth_length',           label: 'طول الطفل عند الولادة',   from: 'data' },
    { key: 'birth_head_circ',        label: 'مقاس راس الطفل عند الولادة', from: 'data' },
    { key: 'nicu_admission',         label: 'دخول الحضانة',            from: 'data' },
    { key: 'nicu_reason',            label: 'سبب دخول الحضانة',        from: 'data' },
    { key: 'nicu_duration_days',     label: 'مدة البقاء في الحضانة',   from: 'data' },
    { key: 'skin_to_skin',           label: 'ملامسة الجلد في الساعة الذهبية', from: 'data' },
    { key: 'bf_golden_hour',         label: 'الرضاعة الطبيعية في الساعة الذهبية', from: 'data' },
    { key: 'session_number',         label: 'موعد الزيارة',            from: 'visit' },
    { key: 'session_date',           label: 'تاريخ الزيارة',           from: 'visit' },
    { key: 'feeding_type',           label: 'الموعد الحالي بشأن الرضاعة', from: 'data' },
    { key: 'feeding_duration',       label: 'مدة الرضاعة الطبيعية المطلقة', from: 'data' },
    { key: 'weight_kg',              label: 'الوزن',                   from: 'data' },
    { key: 'length_cm',              label: 'الطول',                   from: 'data' },
    { key: 'head_circumference_cm',  label: 'محيط الرأس',             from: 'data' },
    { key: 'topic_bf_basics',        label: 'فوائد الرضاعة الطبيعية', from: 'data' },
    { key: 'topic_milk_amount',      label: 'كفاية اللبن وكمية البراز', from: 'data' },
    { key: 'topic_vitamin_d',        label: 'إعطاء الجرعة اليومية من فيتامين د', from: 'data' },
    { key: 'topic_cord_care',        label: 'كيفية رعاية السرة', from: 'data' },
    { key: 'topic_health_card',      label: 'البطاقة الصحية', from: 'data' },
    { key: 'topic_vaccination',      label: 'أهمية الالتزام بتطعيمات الطفل', from: 'data' },
    { key: 'topic_mother_nutrition', label: 'التغذية الصحية للأم المرضعة', from: 'data' },
    { key: 'topic_danger_signs',     label: 'كيفية التعرف على علامات الخطورة', from: 'data' },
    { key: 'topic_growth_motor',     label: 'الرسائل الصحية - النمو الحركي', from: 'data' },
    { key: 'topic_growth_cognitive', label: 'الرسائل الصحية - التطور الإدراكي', from: 'data' },
    { key: 'topic_growth_language',  label: 'الرسائل الصحية - التطور اللغوي', from: 'data' },
    { key: 'topic_positive_parenting', label: 'رسائل التربية الإيجابية', from: 'data' },
    { key: 'topic_stimulating',      label: 'الأنشطة التحفيزية', from: 'data' },
    { key: 'topic_complementary',    label: 'التغذية التكميلية', from: 'data' },
    { key: 'topic_iron_dose',        label: 'إعطاء الجرعة اليومية من الحديد', from: 'data' },
    { key: 'topic_fp_use',           label: 'أهمية استخدام وسيلة تنظيم أسرة', from: 'data' },
    { key: 'fp_attitude',            label: 'موقف استخدام وسيلة تنظيم أسرة', from: 'data' },
    { key: 'new_pregnancy',          label: 'الحمل الجديد', from: 'data' },
    { key: 'unmet_services',         label: 'الخدمات غير ملباه', from: 'data' },
    { key: 'notes',                  label: 'ملاحظات / توصيات', from: 'data' },
    { key: 'next_visit_plan',        label: 'تخطيط الزيارة القادمة', from: 'data' },
  ],

  pregnancy: [
    { key: 'row_no',                 label: 'م',                       from: 'visit' },
    { key: 'governorate',            label: 'المحافظة',                from: 'visit' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',        from: 'visit' },
    { key: 'district',               label: 'المنطقة / الادارة',       from: 'visit' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',         from: 'visit' },
    { key: 'health_facility',        label: 'المنشاة الصحية',          from: 'visit' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',         from: 'visit' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',           from: 'visit' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',            from: 'visit' },
    { key: 'first_visit_date',       label: 'تاريخ اول لقاء',          from: 'visit' },
    { key: 'case_number',            label: 'رقم الحالة',              from: 'visit' },
    { key: 'client_name',            label: 'الاسم',                   from: 'data' },
    { key: 'client_address',         label: 'العنوان',                 from: 'data' },
    { key: 'client_national_id',     label: 'الرقم القومي',            from: 'data' },
    { key: 'client_phone',           label: 'رقم الموبايل',            from: 'data' },
    { key: 'client_age',             label: 'العمر الحالي',            from: 'data' },
    { key: 'age_at_marriage',        label: 'السن عند الزواج',         from: 'data' },
    { key: 'age_at_first_pregnancy', label: 'السن عند الحمل الأول',    from: 'data' },
    { key: 'client_education',       label: 'مستوى التعليم',           from: 'data' },
    { key: 'client_job',             label: 'الوظيفة',                 from: 'data' },
    { key: 'last_menstrual_date',    label: 'تاريخ اخر دورة شهرية',   from: 'data' },
    { key: 'spouse_kinship',         label: 'قرابة بين الزوجين',       from: 'data' },
    { key: 'pregnancy_count',        label: 'عدد مرات الحمل',          from: 'data' },
    { key: 'miscarriage_count',      label: 'عدد مرات الاجهاض',        from: 'data' },
    { key: 'children_count',         label: 'عدد الاطفال',             from: 'data' },
    { key: 'last_pregnancy_gap',     label: 'المدة بين اخر حملين',     from: 'data' },
    { key: 'previous_delivery_type', label: 'نوع الولادة',             from: 'data' },
    { key: 'chronic_hypertension',   label: 'إرتفاع ضغط الدم',         from: 'data' },
    { key: 'chronic_diabetes',       label: 'السكر',                   from: 'data' },
    { key: 'chronic_thyroid',        label: 'إضطرابات الغدة',          from: 'data' },
    { key: 'chronic_anemia',         label: 'الأنيميا',                from: 'data' },
    { key: 'chronic_other',          label: 'اخرى',                    from: 'data' },
    { key: 'supp_before_folic',      label: 'حمض الفوليك (قبل)',       from: 'data' },
    { key: 'supp_before_iron',       label: 'الحديد (قبل)',            from: 'data' },
    { key: 'supp_before_calcium',    label: 'الكالسيوم (قبل)',         from: 'data' },
    { key: 'supp_during_folic',      label: 'حمض الفوليك (أثناء)',     from: 'data' },
    { key: 'supp_during_iron',       label: 'الحديد (أثناء)',          from: 'data' },
    { key: 'supp_during_calcium',    label: 'الكالسيوم (أثناء)',       from: 'data' },
    { key: 'previous_fp_method',     label: 'وسيلة تنظيم الأسرة المستخدمة سابقا', from: 'data' },
    { key: 'previous_fp_duration',   label: 'مدة إستخدام الوسيلة السابقة', from: 'data' },
    { key: 'pregnancy_month',        label: 'شهر الحمل',               from: 'visit' },
    { key: 'session_date',           label: 'التاريخ الزيارة',         from: 'visit' },
    { key: 'topic_nutrition',           label: 'التغذية السليمة', from: 'data' },
    { key: 'topic_supp',                label: 'المكملات الغذائية', from: 'data' },
    { key: 'topic_exercise',            label: 'التمرينات الرياضية', from: 'data' },
    { key: 'topic_rest',                label: 'قسط من النوم والراحة', from: 'data' },
    { key: 'topic_anc',                 label: 'المتابعة الدورية للحمل', from: 'data' },
    { key: 'topic_medication_warning',  label: 'التحذير من تناول الأدوية', from: 'data' },
    { key: 'topic_early_discomfort',    label: 'المتاعب البسيطة في الشهور الأولى', from: 'data' },
    { key: 'topic_late_discomfort',     label: 'المتاعب في الشهور الأخيرة', from: 'data' },
    { key: 'topic_danger_signs',        label: 'علامات الخطر أثناء الحمل', from: 'data' },
    { key: 'topic_preterm',             label: 'مشاكل الولادة المبكرة', from: 'data' },
    { key: 'topic_fetal_movement',      label: 'حركة الجنين', from: 'data' },
    { key: 'topic_breast_changes',      label: 'تغير لون الجلد حول الحلمة', from: 'data' },
    { key: 'topic_clothes',             label: 'إرتداء الملابس الفضفاضة', from: 'data' },
    { key: 'topic_birth_prep',          label: 'الاستعداد للولادة', from: 'data' },
    { key: 'topic_birth_signs',         label: 'علامات الولادة', from: 'data' },
    { key: 'topic_natural_birth',       label: 'مميزات الولادة الطبيعية', from: 'data' },
    { key: 'topic_golden_hour',         label: 'الساعة الذهبية الأولى', from: 'data' },
    { key: 'topic_skin_to_skin',        label: 'ملامسة الجلد للجلد', from: 'data' },
    { key: 'topic_early_bf',            label: 'البداية المبكرة للرضاعة الطبيعية', from: 'data' },
    { key: 'topic_exclusive_bf',        label: 'الرضاعة الطبيعية المطلقة', from: 'data' },
    { key: 'topic_spacing',             label: 'أهمية المباعدة', from: 'data' },
    { key: 'topic_fp_methods',          label: 'وسائل تنظيم الأسرة', from: 'data' },
    { key: 'topic_fp_after_birth',      label: 'إستخدام وسيلة بعد الولادة مباشرة', from: 'data' },
    { key: 'topic_neuro_dev',           label: 'التطور العصبي والنفسي للطفل', from: 'data' },
    { key: 'notes',                  label: 'ملاحظات / توصيات', from: 'data' },
    { key: 'next_visit_plan',        label: 'تخطيط الزيارة القادمة', from: 'data' },
    { key: 'postnatal_followup',     label: 'المتابعة ما بعد الولادة', from: 'data' },
  ],

  family_planning: [
    { key: 'row_no',                 label: 'م',                       from: 'visit' },
    { key: 'governorate',            label: 'المحافظة',                from: 'visit' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',        from: 'visit' },
    { key: 'district',               label: 'المنطقة / الادارة',       from: 'visit' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',         from: 'visit' },
    { key: 'health_facility',        label: 'المنشاة الصحية',          from: 'visit' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',         from: 'visit' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',           from: 'visit' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',            from: 'visit' },
    { key: 'first_visit_date',       label: 'تاريخ اول لقاء',          from: 'visit' },
    { key: 'case_number',            label: 'رقم الحالة',              from: 'visit' },
    { key: 'client_name',            label: 'الاسم',                   from: 'data' },
    { key: 'client_address',         label: 'العنوان',                 from: 'data' },
    { key: 'client_national_id',     label: 'الرقم القومي',            from: 'data' },
    { key: 'client_phone',           label: 'رقم الموبايل',            from: 'data' },
    { key: 'client_age',             label: 'العمر الحالي',            from: 'data' },
    { key: 'age_at_marriage',        label: 'السن عند الزواج',         from: 'data' },
    { key: 'age_at_first_pregnancy', label: 'السن عند الحمل الأول',    from: 'data' },
    { key: 'client_education',       label: 'مستوى التعليم',           from: 'data' },
    { key: 'client_job',             label: 'الوظيفة',                 from: 'data' },
    { key: 'last_menstrual_date',    label: 'تاريخ اخر دورة شهرية',   from: 'data' },
    { key: 'spouse_kinship',         label: 'قرابة بين الزوجين',       from: 'data' },
    { key: 'pregnancy_count',        label: 'عدد مرات الحمل',          from: 'data' },
    { key: 'miscarriage_count',      label: 'عدد مرات الاجهاض',        from: 'data' },
    { key: 'children_count',         label: 'عدد الاطفال',             from: 'data' },
    { key: 'last_pregnancy_gap',     label: 'المدة بين اخر حملين',     from: 'data' },
    { key: 'chronic_hypertension',   label: 'إرتفاع ضغط الدم',         from: 'data' },
    { key: 'chronic_diabetes',       label: 'السكر',                   from: 'data' },
    { key: 'chronic_thyroid',        label: 'إضطرابات الغدة',          from: 'data' },
    { key: 'chronic_anemia',         label: 'الأنيميا',                from: 'data' },
    { key: 'chronic_other',          label: 'اخرى',                    from: 'data' },
    { key: 'previous_fp_method',     label: 'وسيلة تنظيم الأسرة المستخدمة سابقا', from: 'data' },
    { key: 'previous_fp_duration',   label: 'مدة إستخدام الوسيلة السابقة', from: 'data' },
    { key: 'session_date',           label: 'التاريخ الزيارة',         from: 'visit' },
    { key: 'topic_spacing',          label: 'أهمية المباعدة',          from: 'data' },
    { key: 'topic_fp_methods',       label: 'وسائل تنظيم الأسرة',     from: 'data' },
    { key: 'topic_fp_after_birth',   label: 'إستخدام وسيلة بعد الولادة مباشرة', from: 'data' },
    { key: 'notes',                  label: 'ملاحظات / توصيات', from: 'data' },
    { key: 'next_visit_plan',        label: 'تخطيط الزيارة القادمة', from: 'data' },
  ],
};

// =====================================================================
// DB row shapes
// =====================================================================
export interface Counselor {
  id: string;
  user_id: string | null;
  full_name: string;
  national_id: string | null;
  phone: string | null;
  email: string | null;
  employee_code: string | null;
  specialty: string | null;
  work_days: string | null;
  trainings: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_type: VisitType;
  national_id: string;
  full_name: string;
  phone: string | null;
  spouse_name: string | null;
  spouse_national_id: string | null;
  spouse_phone: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  visit_type: VisitType;
  client_id: string;
  counselor_id: string | null;
  governorate: string | null;
  governorate_mfl: string | null;
  district: string | null;
  district_mfl: string | null;
  health_facility: string | null;
  health_facility_mfl: string | null;
  counselor_name: string | null;
  counselor_phone: string | null;
  first_visit_date: string | null;
  case_number: string | null;
  session_number: string | null;
  visit_date: string | null;
  data: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Flattened (for tables / exports)
export interface VisitWithRelations extends Visit {
  client?: Client;
  counselor?: Counselor | null;
}