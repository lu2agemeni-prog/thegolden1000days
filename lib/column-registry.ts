// =====================================================================
// Column Registry — single source of truth for the counseling system
// =====================================================================
// Every field that appears in Excel, in the DB, and in the App must be
// declared here exactly once.  All other files (import, export, template,
// form schemas) derive their behaviour from this file.
//
// Each visit type has a `sheets` entry: an ordered list of columns that
// matches the official Ministry of Health "1000" Excel layout.  The
// column index (1-based) is the source of truth for positional mapping
// when a file is detected as the official 1000 layout.
//
// `from` tells the rest of the app where the value lives in the DB:
//   - 'visit'   → column on `public.visits`
//   - 'data'    → key inside the `visits.data` jsonb payload
//   - 'client'  → column on `public.clients`
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

export const VISIT_TYPE_SHEET_NAME: Record<VisitType, string> = {
  pre_marriage: 'مشورة ما قبل الزواج',
  children: 'سجل المشورة للاطفال',
  pregnancy: 'المشوره الاسريه للحامل',
  family_planning: 'المشوره الاسريه لتنظيم الاسرة',
};

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'phone'
  | 'national_id'
  | 'boolean';

export type ColumnSource = 'visit' | 'data' | 'client';

export interface ColumnDef {
  /** Unique key (snake_case).  Used in JSONB, form state, Excel column header. */
  key: string;
  /** Arabic label shown in Excel, forms, reports, exports. */
  label: string;
  /** Where the value lives in the database. */
  from: ColumnSource;
  /** Optional: section for the dynamic form renderer. */
  section?: string;
  /** Optional: visual width (1 = full row, 3 = 1/3 width). */
  span?: 1 | 3;
  /** Field type — controls input UI and import normalisation. */
  type?: FieldType;
  /** For `select` fields: the canonical Arabic options. */
  options?: string[];
  /** Hint text shown under the field in the form. */
  hint?: string;
  /** Mark as required by the form validator. */
  required?: boolean;
  /** Field is the "primary" key on the client (used to dedupe by (type, nid)). */
  isPrimaryClientKey?: boolean;
  /** Field is the canonical "client name" — used to detect blank rows. */
  isClientName?: boolean;
}

export interface SheetLayout {
  type: VisitType;
  title: string;
  /** Ordered list — index i (0-based) corresponds to Excel column (i+1) = letter A,B,C… */
  columns: ColumnDef[];
}

// =====================================================================
// 1. PRE-MARRIAGE (مشورة ما قبل الزواج)  — 53 columns
// =====================================================================
const PRE_MARRIAGE: SheetLayout = {
  type: 'pre_marriage',
  title: 'سجل مشورة ما قبل الزواج',
  columns: [
    { key: 'row_no',                 label: 'م',                                          from: 'visit',  type: 'number' },
    { key: 'governorate',            label: 'المحافظة',                                   from: 'visit',  type: 'text' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',                           from: 'visit',  type: 'text' },
    { key: 'district',               label: 'المنطقة / الادارة',                          from: 'visit',  type: 'text' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',                            from: 'visit',  type: 'text' },
    { key: 'health_facility',        label: 'المنشاة الصحية',                             from: 'visit',  type: 'text' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',                            from: 'visit',  type: 'text' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',                              from: 'visit',  type: 'text' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',                               from: 'visit',  type: 'phone' },
    { key: 'first_visit_date',       label: 'تاريخ اول لقاء',                             from: 'visit',  type: 'date' },
    { key: 'case_number',            label: 'رقم الحالة',                                 from: 'visit',  type: 'text' },

    { key: 'partner_name',           label: 'اسم الشريك',                                 from: 'data', section: 'partner_male',   span: 3, type: 'text', isClientName: true },
    { key: 'partner_age',            label: 'السن',                                       from: 'data', section: 'partner_male',            type: 'number' },
    { key: 'partner_education',      label: 'مستوى التعليم',                              from: 'data', section: 'partner_male',            type: 'select',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'partner_job',            label: 'الوظيفة',                                    from: 'data', section: 'partner_male',            type: 'select',
      options: ['يعمل','لا يعمل'] },
    { key: 'partner_national_id',    label: 'الرقم القومي',                               from: 'data', section: 'partner_male',   span: 3, type: 'national_id', isPrimaryClientKey: true },
    { key: 'partner_phone',          label: 'رقم الموبايل',                               from: 'data', section: 'partner_male',            type: 'phone' },

    { key: 'spouse_name',            label: 'اسم الشريكه',                                from: 'data', section: 'partner_female', span: 3, type: 'text' },
    { key: 'spouse_age',             label: 'السن',                                       from: 'data', section: 'partner_female',          type: 'number' },
    { key: 'spouse_education',       label: 'مستوى التعليم',                              from: 'data', section: 'partner_female',          type: 'select',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'spouse_job',             label: 'الوظيفة',                                    from: 'data', section: 'partner_female',          type: 'select',
      options: ['يعمل','لا يعمل'] },
    { key: 'spouse_national_id',     label: 'الرقم القومي',                               from: 'data', section: 'partner_female', span: 3, type: 'national_id' },
    { key: 'spouse_phone',           label: 'رقم الموبايل',                               from: 'data', section: 'partner_female',          type: 'phone' },

    { key: 'kinship',                label: 'صلة قرابة بين الشريكين',                     from: 'data', section: 'background',              type: 'select',
      options: ['لا يوجد','من الدرجة الأولى','من الدرجة الثانية','من الدرجة الثالثة','من الدرجة الرابعة','من الدرجة الخامسة'] },
    { key: 'chronic_disease',        label: 'إصابة أي من الشريكين بأمراض مزمنة',         from: 'data', section: 'background',              type: 'select',
      options: ['لا يوجد','أمراض القلب والأوعية الدموية','الضغط','أمراض الجهاز التنفسي','السرطان','السكر','الصرع','الأنيميا','أخرى'] },
    { key: 'family_history',         label: 'تاريخ مرضي لأسرتي الشريكين',                from: 'data', section: 'background',              type: 'select',
      options: ['لا يوجد','الأمراض الوراثية (الأنيميا المنجلية وبيتا ثلاسيميا)','الأمراض المعدية (التهاب الكبد بي، سي، ونقص المناعة المكتسبة)','بعض أنواع السرطان','السكر','السمنة','الربو','أمراض القلب وجلطات الدم','الزهايمر والخرف','التهاب المفاصل','الاكتئاب','ارتفاع ضغط الدم والدهنيات'] },
    { key: 'independent_housing',    label: 'توافر سكن مستقل',                            from: 'data', section: 'background',              type: 'select',
      options: ['يوجد','لا يوجد'] },
    { key: 'children_from_previous', label: 'وجود أطفال لأي من الشريكين من ارتباط سابق',  from: 'data', section: 'background',              type: 'select',
      options: ['يوجد','لا يوجد'] },

    { key: 'session_number',         label: 'رقم اللقاء',                                 from: 'visit', section: 'session',                 type: 'select',
      options: ['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر'] },
    { key: 'session_date',           label: 'التاريخ',                                    from: 'visit', section: 'session',                 type: 'date' },

    { key: 'topic_intro_screening',   label: 'التعريف بخدمات الفحص والمشورة وأهميتها',     from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_partner_choice',    label: 'اختيار شريك الحياة وأهمية التوافق الزوجي',   from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_pre_marriage_rec',  label: 'توصيات ما قبل الزواج والحمل',                from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_intimacy',          label: 'آليات التعامل مع شريك الحياة والألفة والعلاقة الحميمية', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_family_planning',   label: 'التخطيط الأسري وجوانب القوة والتطوير وبناء قائمة الأمنيات', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_conflict_skills',   label: 'مهارات حل الخلافات والضغوط الشخصية',         from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_finance',           label: 'المعاملات المالية',                           from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_family_problems',   label: 'كيفية التعامل مع المشاكل الأسرية',          from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_healthy_lifestyle', label: 'إتباع النمط السليم للحياة الصحية',          from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_repro_health',      label: 'التوعية بالصحة الإنجابية بوجه عام والتخطيط الانجابي', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_diabetes',          label: 'الإرشادات في حالة الإصابة بمرض السكري',      from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_hypertension',      label: 'الإرشادات في حالة الإصابة بارتفاع ضغط الدم',  from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_psych_pressure',    label: 'التعامل مع الضغوط النفسية',                  from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_female_psych',      label: 'الاضطرابات النفسية التي قد تصيب المرأة',      from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_hepatitis_c',       label: 'الإرشادات في حالة الإصابة بفيروس الالتهاب الكبدي سي', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_hepatitis_b',       label: 'الإرشادات في حالة الإصابة بفيروس الالتهاب الكبدي ب', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_hiv',               label: 'الإرشادات في حالة الإصابة بفيروس نقص المناعة البشري', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_rhesus',            label: 'معرفة عامل ريسس',                            from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_genetic_counsel',   label: 'المشورة الوراثية للأقارب',                  from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_parenthood',        label: 'الاستعداد للوالدية',                         from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_natural_birth',     label: 'أهمية الولادة الطبيعية وتجنب القيصرية غير الضرورية', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_birth_spacing',     label: 'أهمية المباعدة بين الولادات',                from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_other',             label: 'موضوعات أخرى (اذكر الموضوعات)',             from: 'data', section: 'topics', type: 'textarea', span: 1 },
  ],
};

// =====================================================================
// 2. CHILDREN (سجل المشورة للأطفال)  — 74 columns
// =====================================================================
const CHILDREN: SheetLayout = {
  type: 'children',
  title: 'سجل المشورة للأطفال',
  columns: [
    { key: 'row_no',                 label: 'م',                       from: 'visit', type: 'number' },
    { key: 'governorate',            label: 'المحافظة',                from: 'visit', type: 'text' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',        from: 'visit', type: 'text' },
    { key: 'district',               label: 'المنطقة / الادارة',       from: 'visit', type: 'text' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',         from: 'visit', type: 'text' },
    { key: 'health_facility',        label: 'المنشاة الصحية',          from: 'visit', type: 'text' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',         from: 'visit', type: 'text' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',           from: 'visit', type: 'text' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',            from: 'visit', type: 'phone' },
    { key: 'first_visit_date',       label: 'تاريخ اول زيارة',         from: 'visit', type: 'date' },
    { key: 'case_number',            label: 'رقم الحالة',              from: 'visit', type: 'text' },

    { key: 'mother_name',            label: 'اسم الام',                from: 'data', section: 'mother', span: 3, type: 'text', isClientName: true },
    { key: 'mother_national_id',     label: 'الرقم القومي للام',       from: 'data', section: 'mother', span: 3, type: 'national_id', isPrimaryClientKey: true },
    { key: 'mother_phone',           label: 'رقم الموبايل للام',       from: 'data', section: 'mother',         type: 'phone' },
    { key: 'mother_birth_date',      label: 'تاريخ ميلاد الام',         from: 'data', section: 'mother',         type: 'date' },
    { key: 'mother_education',       label: 'مستوى التعليم للام',      from: 'data', section: 'mother',         type: 'select',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'mother_children_count',  label: 'عدد الأطفال لدى الام',    from: 'data', section: 'mother',         type: 'number' },
    { key: 'mother_last_gap',        label: 'المدة بين آخر حملين',     from: 'data', section: 'mother',         type: 'number' },
    { key: 'mother_job',             label: 'الوظيفة',                 from: 'data', section: 'mother',         type: 'select',
      options: ['يعمل','لا يعمل'] },

    { key: 'father_national_id',     label: 'الرقم القومي',            from: 'data', section: 'father', span: 3, type: 'national_id' },
    { key: 'father_phone',           label: 'رقم الموبايل',            from: 'data', section: 'father',         type: 'phone' },
    { key: 'father_name',            label: 'اسم الاب',                from: 'data', section: 'father', span: 3, type: 'text' },
    { key: 'father_education',       label: 'مستوى التعليم للاب',      from: 'data', section: 'father',         type: 'select',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },

    { key: 'child_name',             label: 'اسم الطفل',               from: 'data', section: 'child',  span: 3, type: 'text' },
    { key: 'child_birth_date',       label: 'تاريخ الميلاد',           from: 'data', section: 'child',          type: 'date' },
    { key: 'child_age_months',       label: 'العمر الحالي للطفل',      from: 'data', section: 'child',          type: 'number' },
    { key: 'child_gestational_age',  label: 'العمر الرحمي للطفل',     from: 'data', section: 'child',          type: 'number' },
    { key: 'follow_up_place',        label: 'مكان المتابعة',           from: 'data', section: 'child',          type: 'select',
      options: ['وحدة','مستشفى','اخرى'] },
    { key: 'referral_source',        label: 'مصدر الاحالة',            from: 'data', section: 'child',          type: 'select',
      options: ['مستشفى الولادة','عيادة خاصة','عيادة التطعيمات','نصيحة'] },
    { key: 'delivery_type',          label: 'نوع الولادة',             from: 'data', section: 'child',          type: 'select',
      options: ['طبيعى','قيصرى'] },
    { key: 'delivery_place',         label: 'مكان الولادة',            from: 'data', section: 'child',          type: 'select',
      options: ['المستشفى','المنزل'] },
    { key: 'birth_weight',           label: 'وزن الطفل عند الولادة',   from: 'data', section: 'child',          type: 'text' },
    { key: 'birth_length',           label: 'طول الطفل عند الولادة',   from: 'data', section: 'child',          type: 'text' },
    { key: 'birth_head_circ',        label: 'مقاس راس الطفل عند الولادة', from: 'data', section: 'child',       type: 'text' },
    { key: 'nicu_admission',         label: 'دخول الحضانة',            from: 'data', section: 'child',          type: 'select',
      options: ['نعم','لا'] },
    { key: 'nicu_reason',            label: 'سبب دخول الحضانة',        from: 'data', section: 'child',          type: 'select',
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
        'وجود عيب خلقي يمنع الطفل عن التنفس أو الرضاعة.',
      ] },
    { key: 'nicu_duration_days',     label: 'مدة البقاء في الحضانة',   from: 'data', section: 'child',          type: 'number' },
    { key: 'skin_to_skin',           label: 'ملامسة الجلد في الساعة الذهبية الأولى', from: 'data', section: 'child', type: 'select', options: ['نعم','لا'] },
    { key: 'bf_golden_hour',         label: 'الرضاعة الطبيعية في الساعة الذهبية الأولى', from: 'data', section: 'child', type: 'select', options: ['نعم','لا'] },

    { key: 'session_number',         label: 'موعد الزيارة',            from: 'visit', section: 'session',         type: 'select',
      options: ['الأسبوع الأول','عمر شهر','عمر شهرين','عمر 3 شهور','عمر 4 شهور','عمر 6 شهور','عمر 9 شهور','عمر 12 شهر','عمر 18 شهر','عمر سنتين','عمر 3 سنوات'] },
    { key: 'session_date',           label: 'تاريخ الزيارة',           from: 'visit', section: 'session',         type: 'date' },

    { key: 'feeding_type',           label: 'الموعد الحالي بشأن الرضاعة', from: 'data', section: 'feeding',     type: 'select',
      options: ['رضاعة طبيعية مطلقة','رضاعة طبيعية مع سوائل وأعشاب','رضاعة طبيعية مع صناعي','رضاعة لبن صناعي'] },
    { key: 'feeding_duration',       label: 'مدة الرضاعة الطبيعية المطلقة', from: 'data', section: 'feeding',  type: 'select',
      options: ['3 شهور','4 شهور','6 شهور'] },

    { key: 'weight_kg',              label: 'الوزن',                   from: 'data', section: 'growth',          type: 'number' },
    { key: 'length_cm',              label: 'الطول',                   from: 'data', section: 'growth',          type: 'number' },
    { key: 'head_circumference_cm',  label: 'محيط الرأس',              from: 'data', section: 'growth',          type: 'number' },

    { key: 'topic_bf_basics',           label: 'فوائد الرضاعة الطبيعية والأوضاع وعلامات الجوع والشبع', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_milk_amount',         label: 'كفاية اللبن وكمية البراز',                              from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_vitamin_d',           label: 'إعطاء الجرعة اليومية من فيتامين د',                    from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_cord_care',           label: 'كيفية رعاية السرة والاهتمام بنظافة الطفل',            from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_health_card',         label: 'البطاقة الصحية وأهمية المتابعة الدورية ومنحنيات النمو', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_vaccination',         label: 'أهمية الالتزام بتطعيمات الطفل',                       from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_mother_nutrition',    label: 'التغذية الصحية للأم المرضعة',                         from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_danger_signs',        label: 'كيفية التعرف على علامات الخطورة',                    from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_growth_motor',        label: 'الرسائل الصحية - النمو والتطور الحركي',               from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_growth_cognitive',    label: 'الرسائل الصحية - التطور الإدراكي والمعرفي',         from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_growth_language',     label: 'الرسائل الصحية - التطور اللغوي',                     from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_positive_parenting',  label: 'رسائل التربية الإيجابية',                           from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_stimulating',         label: 'الأنشطة التحفيزية',                                  from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_complementary',       label: 'التوعية عن التغذية التكميلية وسلامة الغذاء',         from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_iron_dose',           label: 'إعطاء الجرعة اليومية من الحديد',                     from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_fp_use',              label: 'أهمية استخدام وسيلة تنظيم أسرة وأهمية المباعدة',   from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'fp_attitude',               label: 'موقف استخدام وسيلة تنظيم أسرة',                    from: 'data', section: 'topics', type: 'select',
      options: ['توجد','لا يوجد','وسؤال الحمل الجديد','مرغوب','غير مرغوب','حدث','لم يحدث'] },
    { key: 'new_pregnancy',             label: 'الحمل الجديد',                                       from: 'data', section: 'topics', type: 'select',
      options: ['مرغوب','غير مرغوب','وسؤال الخدمات غير الملباة'] },
    { key: 'unmet_services',            label: 'الخدمات غير ملباة',                                 from: 'data', section: 'topics', type: 'select',
      options: ['تم','لم يتم'] },

    { key: 'notes',                    label: 'ملاحظات / توصيات',                                   from: 'data', section: 'closing', type: 'textarea', span: 1 },
    { key: 'next_visit_plan',          label: 'تخطيط الزيارة القادمة',                              from: 'data', section: 'closing', type: 'textarea', span: 1 },
  ],
};

// =====================================================================
// 3. PREGNANCY (المشورة الأسرية للحامل)  — 87 columns
// =====================================================================
const PREGNANCY: SheetLayout = {
  type: 'pregnancy',
  title: 'المشورة الأسرية للحامل',
  columns: [
    { key: 'row_no',                 label: 'م',                       from: 'visit', type: 'number' },
    { key: 'governorate',            label: 'المحافظة',                from: 'visit', type: 'text' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',        from: 'visit', type: 'text' },
    { key: 'district',               label: 'المنطقة / الادارة',       from: 'visit', type: 'text' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',         from: 'visit', type: 'text' },
    { key: 'health_facility',        label: 'المنشاة الصحية',          from: 'visit', type: 'text' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',         from: 'visit', type: 'text' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',           from: 'visit', type: 'text' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',            from: 'visit', type: 'phone' },
    { key: 'first_visit_date',       label: 'تاريخ اول لقاء',          from: 'visit', type: 'date' },
    { key: 'case_number',            label: 'رقم الحالة',              from: 'visit', type: 'text' },

    { key: 'client_name',            label: 'الاسم',                   from: 'data', section: 'client', span: 3, type: 'text', isClientName: true },
    { key: 'client_address',         label: 'العنوان',                 from: 'data', section: 'client', span: 3, type: 'text' },
    { key: 'client_national_id',     label: 'الرقم القومي',            from: 'data', section: 'client', span: 3, type: 'national_id', isPrimaryClientKey: true },
    { key: 'client_phone',           label: 'رقم الموبايل',            from: 'data', section: 'client',         type: 'phone' },
    { key: 'client_age',             label: 'العمر الحالي',            from: 'data', section: 'client',         type: 'number' },
    { key: 'age_at_marriage',        label: 'السن عند الزواج',         from: 'data', section: 'client',         type: 'number' },
    { key: 'age_at_first_pregnancy', label: 'السن عند الحمل الأول',    from: 'data', section: 'client',         type: 'number' },
    { key: 'client_education',       label: 'مستوى التعليم',           from: 'data', section: 'client',         type: 'select',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'client_job',             label: 'الوظيفة',                 from: 'data', section: 'client',         type: 'select',
      options: ['يعمل','لا يعمل'] },
    { key: 'last_menstrual_date',    label: 'تاريخ آخر دورة شهرية',   from: 'data', section: 'client',         type: 'date' },

    { key: 'spouse_kinship',         label: 'قرابة بين الزوجين',       from: 'data', section: 'background',     type: 'select',
      options: ['لا يوجد','من الدرجة الأولى','من الدرجة الثانية','من الدرجة الثالثة','من الدرجة الرابعة','من الدرجة الخامسة'] },
    { key: 'pregnancy_count',        label: 'عدد مرات الحمل',          from: 'data', section: 'background',     type: 'number' },
    { key: 'miscarriage_count',      label: 'عدد مرات الإجهاض',       from: 'data', section: 'background',     type: 'number' },
    { key: 'children_count',         label: 'عدد الأطفال',             from: 'data', section: 'background',     type: 'number' },
    { key: 'last_pregnancy_gap',     label: 'المدة بين آخر حملين',    from: 'data', section: 'background',     type: 'number' },
    { key: 'previous_delivery_type', label: 'نوع الولادة',             from: 'data', section: 'background',     type: 'select',
      options: ['طبيعى','قيصرى'] },
    { key: 'chronic_hypertension',   label: 'إرتفاع ضغط الدم',         from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_diabetes',       label: 'السكر',                    from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_thyroid',        label: 'اضطرابات الغدة',           from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_anemia',         label: 'الأنيميا',                 from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_other',          label: 'أمراض مزمنة أخرى',         from: 'data', section: 'background',     type: 'text' },

    { key: 'supp_before_folic',      label: 'حمض الفوليك (قبل الحمل)', from: 'data', section: 'supplements',    type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'supp_before_iron',       label: 'الحديد (قبل الحمل)',      from: 'data', section: 'supplements',    type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'supp_before_calcium',    label: 'الكالسيوم (قبل الحمل)',   from: 'data', section: 'supplements',    type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'supp_during_folic',      label: 'حمض الفوليك (أثناء الحمل)', from: 'data', section: 'supplements',  type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'supp_during_iron',       label: 'الحديد (أثناء الحمل)',    from: 'data', section: 'supplements',    type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'supp_during_calcium',    label: 'الكالسيوم (أثناء الحمل)', from: 'data', section: 'supplements',    type: 'select', options: ['يوجد','لا يوجد'] },

    { key: 'previous_fp_method',     label: 'وسيلة تنظيم الأسرة المستخدمة سابقاً', from: 'data', section: 'fp_history', type: 'select',
      options: ['لا يوجد','اقراص','حقن','كبسولات','لولب','طرق طبيعية'] },
    { key: 'previous_fp_duration',   label: 'مدة استخدام الوسيلة السابقة', from: 'data', section: 'fp_history', type: 'text' },

    { key: 'pregnancy_month',        label: 'شهر الحمل',               from: 'visit', section: 'session',         type: 'select',
      options: ['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع'] },
    { key: 'session_date',           label: 'التاريخ الزيارة',         from: 'visit', section: 'session',         type: 'date' },

    { key: 'topic_nutrition',           label: 'التغذية السليمة',                                       from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_supp',                label: 'المكملات الغذائية',                                      from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_exercise',            label: 'التمارين الرياضية',                                      from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_rest',                label: 'قسط من النوم والراحة',                                  from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_anc',                 label: 'المتابعة الدورية للحمل',                                from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_medication_warning',  label: 'التحذير من تناول الأدوية بدون استشارة طبيب والتعرض للتدخين والأبخرة', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_early_discomfort',    label: 'المتاعب البسيطة في الشهور الأولى',                     from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_late_discomfort',     label: 'المتاعب في الشهور الأخيرة',                            from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_danger_signs',        label: 'علامات الخطر أثناء الحمل',                             from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_preterm',             label: 'مشاكل الولادة المبكرة وكيفية تجنبها',                 from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_fetal_movement',      label: 'حركة الجنين / معرفة جنس الجنين / تمييز الأصوات من قبل الجنين', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_breast_changes',      label: 'تغير لون الجلد حول الحلمة وظهور بعض إفرازات من الثدي', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_clothes',             label: 'ارتداء الملابس الفضفاضة المريحة',                       from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_birth_prep',          label: 'الاستعداد للولادة / تحضير ملابس المولود',               from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_birth_signs',         label: 'علامات الولادة',                                        from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_natural_birth',       label: 'مميزات الولادة الطبيعية',                              from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_golden_hour',         label: 'الساعة الذهبية الأولى',                                from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_skin_to_skin',        label: 'ملامسة الجلد للجلد',                                    from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_early_bf',            label: 'البداية المبكرة للرضاعة الطبيعية',                      from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_exclusive_bf',        label: 'الرضاعة الطبيعية المطلقة',                             from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_spacing',             label: 'أهمية المباعدة',                                         from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_fp_methods',          label: 'وسائل تنظيم الأسرة',                                    from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_fp_after_birth',      label: 'استخدام وسيلة بعد الولادة مباشرة',                     from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_neuro_dev',           label: 'التطور العصبي والنفسي للطفل',                          from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },

    { key: 'notes',                    label: 'ملاحظات / توصيات',                                     from: 'data', section: 'closing', type: 'textarea', span: 1 },
    { key: 'next_visit_plan',          label: 'تخطيط الزيارة القادمة',                                from: 'data', section: 'closing', type: 'textarea', span: 1 },
    { key: 'postnatal_followup',       label: 'المتابعة ما بعد الولادة',                              from: 'data', section: 'closing', type: 'textarea', span: 1 },
  ],
};

// =====================================================================
// 4. FAMILY PLANNING (المشورة الأسرية لتنظيم الأسرة)  — 57 columns
// =====================================================================
const FAMILY_PLANNING: SheetLayout = {
  type: 'family_planning',
  title: 'المشورة الأسرية لتنظيم الأسرة',
  columns: [
    { key: 'row_no',                 label: 'م',                       from: 'visit', type: 'number' },
    { key: 'governorate',            label: 'المحافظة',                from: 'visit', type: 'text' },
    { key: 'governorate_mfl',        label: 'كود المحافظة MFL',        from: 'visit', type: 'text' },
    { key: 'district',               label: 'المنطقة / الادارة',       from: 'visit', type: 'text' },
    { key: 'district_mfl',           label: 'كود الادارة MFL',         from: 'visit', type: 'text' },
    { key: 'health_facility',        label: 'المنشاة الصحية',          from: 'visit', type: 'text' },
    { key: 'health_facility_mfl',    label: 'كود المنشاة MFS',         from: 'visit', type: 'text' },
    { key: 'counselor_name',         label: 'مقدمة المشورة',           from: 'visit', type: 'text' },
    { key: 'counselor_phone',        label: 'رقم الموبايل',            from: 'visit', type: 'phone' },
    { key: 'first_visit_date',       label: 'تاريخ اول لقاء',          from: 'visit', type: 'date' },
    { key: 'case_number',            label: 'رقم الحالة',              from: 'visit', type: 'text' },

    { key: 'client_name',            label: 'الاسم',                   from: 'data', section: 'client', span: 3, type: 'text', isClientName: true },
    { key: 'client_address',         label: 'العنوان',                 from: 'data', section: 'client', span: 3, type: 'text' },
    { key: 'client_national_id',     label: 'الرقم القومي',            from: 'data', section: 'client', span: 3, type: 'national_id', isPrimaryClientKey: true },
    { key: 'client_phone',           label: 'رقم الموبايل',            from: 'data', section: 'client',         type: 'phone' },
    { key: 'client_age',             label: 'العمر الحالي',            from: 'data', section: 'client',         type: 'number' },
    { key: 'age_at_marriage',        label: 'السن عند الزواج',         from: 'data', section: 'client',         type: 'number' },
    { key: 'age_at_first_pregnancy', label: 'السن عند الحمل الأول',    from: 'data', section: 'client',         type: 'number' },
    { key: 'client_education',       label: 'مستوى التعليم',           from: 'data', section: 'client',         type: 'select',
      options: ['امي','يجيد القراءة','مؤهل متوسط','فوق متوسط','مؤهل عالي'] },
    { key: 'client_job',             label: 'الوظيفة',                 from: 'data', section: 'client',         type: 'select',
      options: ['يعمل','لا يعمل'] },
    { key: 'last_menstrual_date',    label: 'تاريخ آخر دورة شهرية',   from: 'data', section: 'client',         type: 'date' },

    { key: 'spouse_kinship',         label: 'قرابة بين الزوجين',       from: 'data', section: 'background',     type: 'select',
      options: ['لا يوجد','من الدرجة الأولى','من الدرجة الثانية','من الدرجة الثالثة','من الدرجة الرابعة','من الدرجة الخامسة'] },
    { key: 'pregnancy_count',        label: 'عدد مرات الحمل',          from: 'data', section: 'background',     type: 'number' },
    { key: 'miscarriage_count',      label: 'عدد مرات الإجهاض',       from: 'data', section: 'background',     type: 'number' },
    { key: 'children_count',         label: 'عدد الأطفال',             from: 'data', section: 'background',     type: 'number' },
    { key: 'last_pregnancy_gap',     label: 'المدة بين آخر حملين',    from: 'data', section: 'background',     type: 'number' },
    { key: 'chronic_hypertension',   label: 'إرتفاع ضغط الدم',         from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_diabetes',       label: 'السكر',                    from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_thyroid',        label: 'اضطرابات الغدة',           from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_anemia',         label: 'الأنيميا',                 from: 'data', section: 'background',     type: 'select', options: ['يوجد','لا يوجد'] },
    { key: 'chronic_other',          label: 'أمراض مزمنة أخرى',         from: 'data', section: 'background',     type: 'text' },

    { key: 'previous_fp_method',     label: 'وسيلة تنظيم الأسرة المستخدمة سابقاً', from: 'data', section: 'fp_history', type: 'select',
      options: ['لا يوجد','اقراص','حقن','كبسولات','لولب','طرق طبيعية'] },
    { key: 'previous_fp_duration',   label: 'مدة استخدام الوسيلة السابقة', from: 'data', section: 'fp_history', type: 'text' },

    { key: 'session_date',           label: 'التاريخ الزيارة',         from: 'visit', section: 'session',         type: 'date' },

    { key: 'topic_spacing',          label: 'أهمية المباعدة',          from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_fp_methods',       label: 'وسائل تنظيم الأسرة',     from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },
    { key: 'topic_fp_after_birth',   label: 'استخدام وسيلة بعد الولادة مباشرة', from: 'data', section: 'topics', type: 'select', options: ['تم','لم يتم'] },

    { key: 'notes',                  label: 'ملاحظات / توصيات',        from: 'data', section: 'closing', type: 'textarea', span: 1 },
    { key: 'next_visit_plan',        label: 'تخطيط الزيارة القادمة',   from: 'data', section: 'closing', type: 'textarea', span: 1 },
  ],
};

// =====================================================================
// Aggregated registry
// =====================================================================
export const SHEET_LAYOUTS: Record<VisitType, SheetLayout> = {
  pre_marriage: PRE_MARRIAGE,
  children: CHILDREN,
  pregnancy: PREGNANCY,
  family_planning: FAMILY_PLANNING,
};

/** Quick lookup: visit type → primary client NID key in `data` jsonb */
export const PRIMARY_NID_KEY: Record<VisitType, string> = {
  pre_marriage: 'partner_national_id',
  children: 'mother_national_id',
  pregnancy: 'client_national_id',
  family_planning: 'client_national_id',
};

/** Quick lookup: visit type → client phone key in `data` jsonb */
export const PHONE_KEY: Record<VisitType, string> = {
  pre_marriage: 'partner_phone',
  children: 'mother_phone',
  pregnancy: 'client_phone',
  family_planning: 'client_phone',
};

/** Quick lookup: visit type → client display name key */
export const CLIENT_NAME_KEY: Record<VisitType, string> = {
  pre_marriage: 'partner_name',
  children: 'mother_name',
  pregnancy: 'client_name',
  family_planning: 'client_name',
};

// =====================================================================
// Helpers
// =====================================================================

/** Convert a 0-based column index to an Excel letter ("A", "B", ... "AA", "BA"). */
export function colIndexToLetter(idx: number): string {
  let s = '';
  let n = idx;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

/** Find the registry key for a sheet name (loose Arabic match). */
export function detectVisitTypeFromSheetName(name: string): VisitType | null {
  const trimmed = (name ?? '').trim();
  // exact match first
  for (const t of VISIT_TYPES) {
    if (trimmed === VISIT_TYPE_SHEET_NAME[t]) return t;
  }
  // loose contains
  const cleaned = trimmed.replace(/[\s\u200f\u200e]/g, '');
  if (cleaned.includes('زواج')) return 'pre_marriage';
  if (cleaned.includes('طفل')) return 'children';
  if (cleaned.includes('حامل')) return 'pregnancy';
  if (cleaned.includes('تنظيم')) return 'family_planning';
  return null;
}

/** All `data` columns of a type — used to build the `data` jsonb payload. */
export function dataColumns(type: VisitType): ColumnDef[] {
  return SHEET_LAYOUTS[type].columns.filter((c) => c.from === 'data');
}

/** All `visit` columns of a type — used to build the visits table insert. */
export function visitColumns(type: VisitType): ColumnDef[] {
  return SHEET_LAYOUTS[type].columns.filter((c) => c.from === 'visit');
}

/** Build a `data` jsonb from a flat row mapping (Excel col key → value). */
export function buildDataPayload(
  type: VisitType,
  raw: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const c of dataColumns(type)) {
    const v = raw[c.key];
    if (v === undefined || v === null || v === '') continue;
    out[c.key] = normaliseValue(v, c);
  }
  return out;
}

/** Build a `visit` row object (only the columns marked `from === 'visit'`). */
export function buildVisitRow(
  type: VisitType,
  raw: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const c of visitColumns(type)) {
    if (c.key === 'row_no') continue; // derived
    const v = raw[c.key];
    if (v === undefined || v === null || v === '') {
      out[c.key] = null;
      continue;
    }
    out[c.key] = normaliseValue(v, c);
  }
  return out;
}

// =====================================================================
// Value normalisation
// =====================================================================

/** Convert a cell value coming from Excel into a clean value matching the column type. */
export function normaliseValue(v: unknown, col: ColumnDef): unknown {
  if (v === null || v === undefined) return null;

  // ───── Strings ─────
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '' || trimmed === '#VALUE!' || trimmed === '#REF!' || trimmed === '#NAME?') {
      return null;
    }
    // For select fields, canonicalise common variants (e.g. "لايوجد" → "لا يوجد", "تم " → "تم")
    if (col.type === 'select' && col.options && col.options.length) {
      const canon = canonicaliseSelect(trimmed, col.options);
      if (canon !== undefined) return canon;
      return trimmed;
    }
    if (col.type === 'number') {
      const digits = trimmed.replace(/[^\d.\-]/g, '');
      if (digits === '' || digits === '-' || digits === '.') return null;
      const n = Number(digits);
      return Number.isFinite(n) ? n : null;
    }
    if (col.type === 'date' || col.key.includes('date') || col.key === 'first_visit_date' || col.key === 'session_date') {
      const d = parseFlexibleDate(trimmed);
      return d ?? trimmed;
    }
    if (col.type === 'national_id') {
      const digits = trimmed.replace(/\D/g, '');
      return digits || null;
    }
    if (col.type === 'phone') {
      const digits = trimmed.replace(/\D/g, '');
      return digits || null;
    }
    return trimmed;
  }

  // ───── Numbers ─────
  if (typeof v === 'number') {
    // Numbers are not valid for these text-like fields (likely a mis-formatted
    // cell where the source XLSX stored a date or junk in a text/phone column)
    if (
      col.type === 'phone' ||
      col.type === 'national_id' ||
      col.type === 'text' ||
      col.type === 'select' ||
      col.type === 'textarea'
    ) {
      return null;
    }
    if (col.type === 'date' || col.key.includes('date') || col.key === 'first_visit_date' || col.key === 'session_date') {
      // Excel serial number
      if (v > 25000 && v < 80000) {
        const date = new Date(Math.round((v - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
      }
      return null;
    }
    return v;
  }

  // ───── Dates ─────
  if (v instanceof Date) {
    if (!isNaN(v.getTime())) {
      if (col.type === 'date' || col.key.includes('date') || col.key === 'first_visit_date' || col.key === 'session_date') {
        return v.toISOString().slice(0, 10);
      }
    }
    return null;
  }

  return v;
}

/**
 * Match a free-text value against the canonical options of a `select` field.
 * Handles common variants: trailing spaces, "يوجد / لا يوجد" with extra spaces,
 * "تم" / "لم يتم", "نعم" / "لا", synonyms.
 */
export function canonicaliseSelect(value: string, options: string[]): string | undefined {
  // Two normalisers:
  //  - `norm`: collapses whitespace to a single space, keeps spaces
  //  - `normCompact`: removes all whitespace entirely
  const norm = (s: string) =>
    s.replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\s\u200f\u200e]+/g, ' ')
      .trim()
      .toLowerCase();
  const normCompact = (s: string) => norm(s).replace(/\s+/g, '');

  const target = norm(value);
  const targetCompact = target.replace(/\s+/g, '');

  // Sort options by length (longest first) so "لا يوجد" is tried before "يوجد"
  const sortedOptions = [...options].sort((a, b) => norm(b).length - norm(a).length);

  // 1) Exact match (after normalisation, with and without spaces)
  for (const opt of sortedOptions) {
    if (norm(opt) === target) return opt;
    if (normCompact(opt) === targetCompact) return opt;
  }

  // 2) Substring match using the **compact** form so "لايوجد" matches
  //    "لا يوجد" (both become "لايوجد").  Length-bounded to avoid matching
  //    against overly short options.
  for (const opt of sortedOptions) {
    const optCompact = normCompact(opt);
    if (optCompact.length >= 3 && targetCompact.includes(optCompact)) return opt;
  }
  // Inverse: target is a longer form that includes the option's compact form
  for (const opt of sortedOptions) {
    const optCompact = normCompact(opt);
    if (targetCompact.length >= 3 && optCompact.includes(targetCompact)) return opt;
  }

  // 3) Common synonym map for very common variants
  const SYNONYMS: Record<string, string[]> = {
    'لايوجد': ['لا يوجد'],
    'لايوجد ': ['لا يوجد'],
    'يوجد ': ['يوجد'],
    'لايوجد.': ['لا يوجد'],
    'نعم ': ['نعم'],
    'لا ': ['لا'],
    'تم ': ['تم'],
    'لم يتم ': ['لم يتم'],
    'لم يتم.': ['لم يتم'],
  };
  for (const [variant, canonList] of Object.entries(SYNONYMS)) {
    if (norm(variant) === target || normCompact(variant) === targetCompact) {
      for (const c of canonList) {
        if (options.includes(c)) return c;
      }
    }
  }
  return undefined;
}

/** Parse a flexible date. Accepts a string, a number (Excel serial), or a Date. Returns `YYYY-MM-DD` or null. */
export function parseFlexibleDate(input: unknown): string | null {
  if (input === null || input === undefined || input === '') return null;

  // Numbers: could be an Excel serial date (or a junk integer — sanity check)
  if (typeof input === 'number') {
    if (input > 25000 && input < 80000) {
      const date = new Date(Math.round((input - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
    return null;
  }

  if (input instanceof Date) {
    if (!isNaN(input.getTime())) return input.toISOString().slice(0, 10);
    return null;
  }

  const s = String(input).trim();
  if (!s) return null;

  // ISO YYYY-MM-DD
  let m = s.match(/^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  // DD/MM/YYYY
  m = s.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  // Native Date
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}
