export const conjunctionsPack = {
  id: 'conjunctions',
  name: 'YÖKDİL & YDS Akademik Bağlaçlar Hazinesi',
  description: 'Sınavlarda en çok sorulan zıtlık, neden-sonuç, koşul, amaç, zaman ve ekleme bağlaçları (60 Kelime)',
  icon: '🔗',
  color: '#8b5cf6',
  words: [
    {
      english: 'nevertheless / nonetheless',
      turkish: 'buna rağmen, yine de',
      word_type: 'Bağlaç (Zıtlık)',
      synonyms: 'however, yet, even so',
      example: 'The weather was freezing; nevertheless, the researchers continued their field work.',
      notes: 'Cümle başında veya ortasında noktalı virgül sonrasında sıkça sorulur.',
      difficulty: 2
    },
    {
      english: 'furthermore / moreover',
      turkish: 'dahası, üstelik, ek olarak',
      word_type: 'Bağlaç (Ekleme)',
      synonyms: 'in addition, besides, what is more',
      example: 'The new drug is highly effective against bacteria; furthermore, it has very few side effects.',
      notes: 'Olumlu bir özelliğe başka olumlu özellik, ya da olumsuza olumsuz ekler.',
      difficulty: 2
    },
    {
      english: 'consequently / therefore',
      turkish: 'sonuç olarak, bu nedenle, dolayısıyla',
      word_type: 'Bağlaç (Neden-Sonuç)',
      synonyms: 'as a result, thus, hence, accordingly',
      example: 'Global temperatures are rising rapidly; consequently, polar ice caps are melting at an alarming rate.',
      notes: 'Sebep-sonuç ilişkisini bağlayan en temel YÖKDİL bağlaçlarındandır.',
      difficulty: 1
    },
    {
      english: 'whereas / while',
      turkish: '-e karşın, oysa, halbuki (karşılaştırma)',
      word_type: 'Bağlaç (Zıtlık / Karşılaştırma)',
      synonyms: 'in contrast to, whilst',
      example: 'Children acquire languages naturally, whereas adults typically require formal instruction and effort.',
      notes: 'İki farklı nesne, grup veya durumu karşılaştırırken kullanılır.',
      difficulty: 2
    },
    {
      english: 'in spite of / despite',
      turkish: '-e rağmen, -e karşın (isim alır)',
      word_type: 'Bağlaç (Zıtlık)',
      synonyms: 'notwithstanding, regardless of',
      example: 'Despite the harsh winter conditions, the migration of the birds remained on schedule.',
      notes: 'Kendinden sonra cümle değil, İSİM veya Ving alır. (Despite of DİYE BİR KULLANIM YOKTUR!)',
      difficulty: 1
    },
    {
      english: 'unless',
      turkish: '-medikçe, -madığı sürece (if not)',
      word_type: 'Bağlaç (Koşul)',
      synonyms: 'if not, except if',
      example: 'Unless urgent action is taken to reduce emissions, sea levels will rise significantly by 2050.',
      notes: 'Kendi bulunduğu yan cümle yapıca olumlu, anlamca olumsuz katar.',
      difficulty: 2
    },
    {
      english: 'provided that / as long as',
      turkish: 'koşuluyla, -mek şartıyla, sürece',
      word_type: 'Bağlaç (Koşul)',
      synonyms: 'on condition that, so long as, if only',
      example: 'The surgery is considered safe provided that the patient has no underlying cardiovascular disease.',
      notes: 'If (eğer) bağlacı ile yakın anlamlıdır, şart belirtir.',
      difficulty: 2
    },
    {
      english: 'owing to / due to',
      turkish: '-den dolayı, yüzünden, sebebiyle',
      word_type: 'Bağlaç (Neden-Sonuç - İsim alır)',
      synonyms: 'because of, on account of, as a result of',
      example: 'The clinical trial was postponed owing to unexpected safety concerns among the volunteers.',
      notes: 'Kendinden sonra tam cümle almaz, isim öbeği (noun phrase) alır.',
      difficulty: 2
    },
    {
      english: 'so that / in order that',
      turkish: 'diye, -mek için (amaç bildirir)',
      word_type: 'Bağlaç (Amaç)',
      synonyms: 'to the end that, for the purpose that',
      example: 'Vaccines are kept at low temperatures so that their active biological ingredients do not deteriorate.',
      notes: 'Genelde yan cümlede can/could/may/might/will modallarıyla beraber kullanılır.',
      difficulty: 1
    },
    {
      english: 'even if / even though',
      turkish: '-sa bile / -e rağmen (zıtlık)',
      word_type: 'Bağlaç (Zıtlık)',
      synonyms: 'although, though, much as',
      example: 'Even though antibiotics cure bacterial infections, they are completely useless against viruses.',
      notes: 'Even though kesin olan durumlara rağmen, even if varsayımsal zıtlıklarda kullanılır.',
      difficulty: 1
    },
    {
      english: 'on the contrary / in contrast',
      turkish: 'aksine, tam tersine',
      word_type: 'Bağlaç (Zıtlık)',
      synonyms: 'conversely, by contrast',
      example: 'The experimental results did not support the hypothesis; on the contrary, they contradicted it entirely.',
      notes: 'Bir iddianın yanlış olduğunu söyleyip tam tersi gerçeği vurgularken kullanılır.',
      difficulty: 2
    },
    {
      english: 'in case / in the event of',
      turkish: '-durumunda, ihtimaline karşı, olursa diye',
      word_type: 'Bağlaç (Koşul / Önlem)',
      synonyms: 'lest, should there be',
      example: 'Hospitals maintain backup generators in case the city grid experiences a sudden power outage.',
      notes: 'Önlem alma anlamı taşır, ardındaki cümle gelecekteki bir riski belirtir.',
      difficulty: 2
    },
    {
      english: 'subsequently / afterwards',
      turkish: 'ardından, daha sonra, akabinde',
      word_type: 'Bağlaç (Zaman / Sıralama)',
      synonyms: 'later, thereafter, following this',
      example: 'The cells were exposed to radiation and subsequently examined under a high-powered microscope.',
      notes: 'Kronolojik ardışık olayları bağlar.',
      difficulty: 2
    },
    {
      english: 'notwithstanding',
      turkish: '-e rağmen, -e karşın (isim veya cümle)',
      word_type: 'Bağlaç (Zıtlık)',
      synonyms: 'despite, regardless of, in spite of',
      example: 'Notwithstanding the high cost of the equipment, the laboratory decided to purchase the electron microscope.',
      notes: 'Akademik dili en ağır olan zıtlık bağlaçlarındandır.',
      difficulty: 3
    },
    {
      english: 'inasmuch as / seeing that',
      turkish: '-dığı için, mademki, göz önüne alındığında',
      word_type: 'Bağlaç (Neden-Sonuç)',
      synonyms: 'since, because, considering that',
      example: 'Inasmuch as the budget has been cut by half, we must prioritize only our most critical research projects.',
      notes: 'Because veya since bağlacının ileri düzey resmi/akademik karşılığıdır.',
      difficulty: 3
    },
    {
      english: 'regardless of / irrespective of',
      turkish: '-e bakılmaksızın, ne olursa olsun',
      word_type: 'Bağlaç (İstisna / Zıtlık)',
      synonyms: 'without considering, no matter what',
      example: 'All patients receive the exact same standard of medical care regardless of their socioeconomic status.',
      notes: 'Ayrım gözetmeden, her koşulda geçerli olma vurgusu yapar.',
      difficulty: 2
    },
    {
      english: 'on condition that',
      turkish: 'şartıyla, koşuluyla',
      word_type: 'Bağlaç (Koşul)',
      synonyms: 'provided that, assuming that, if',
      example: 'The university granted him a leave of absence on condition that he finishes his doctoral thesis within two years.',
      notes: 'Kesin bir taahhüt ve kural gerektiren koşul cümlelerinde kullanılır.',
      difficulty: 2
    },
    {
      english: 'conversely / inversely',
      turkish: 'tam tersine, ters orantılı olarak',
      word_type: 'Bağlaç (Zıtlık / Karşılaştırma)',
      synonyms: 'on the other hand, oppositely',
      example: 'Higher interest rates tend to reduce inflation; conversely, lowering rates stimulates consumer spending.',
      notes: 'İki durumun birbirine zıt veya ters yönde çalıştığını gösterir.',
      difficulty: 3
    },
    {
      english: 'hence / thus',
      turkish: 'bundan dolayı, nitekim, böylece',
      word_type: 'Bağlaç (Neden-Sonuç)',
      synonyms: 'therefore, accordingly, consequently',
      example: 'The chemical compound is extremely unstable; hence, it must be stored in specialized pressurized containers.',
      notes: 'Cümle içinde doğrudan sıfat veya isim öbeği bağlayıcı olarak da kullanılabilir.',
      difficulty: 2
    },
    {
      english: 'lest',
      turkish: 'olmasın diye, -mek korkusuyla',
      word_type: 'Bağlaç (Amaç / Önlem)',
      synonyms: 'for fear that, so as not to',
      example: 'The researchers doubled the security protocols lest any dangerous pathogen escape the laboratory facility.',
      notes: 'Arkasından genelde should modali veya yalın fiil alır, olumsuz anlam taşır.',
      difficulty: 3
    },
    {
      english: 'as though / as if',
      turkish: 'sanki, -mış gibi',
      word_type: 'Bağlaç (Benzetme / Varsayım)',
      synonyms: 'like, in a manner as though',
      example: 'The geological strata behaved during the earthquake as though they were composed of liquid rather than solid rock.',
      notes: 'Gerçek dışı durumlarda geçmiş zaman (past/past perfect) kipleriyle kullanılır.',
      difficulty: 2
    },
    {
      english: 'no sooner ... than',
      turkish: 'yapmasıyla etmesi bir oldu, -er -mez',
      word_type: 'Bağlaç (Zaman)',
      synonyms: 'hardly ... when, scarcely ... when',
      example: 'No sooner had the astronauts landed on the lunar surface than they began collecting soil and rock specimens.',
      notes: 'No sooner cümle başında kullanıldığında devrik (inversion) yapı gerektirir.',
      difficulty: 3
    },
    {
      english: 'hardly / scarcely ... when',
      turkish: 'henüz -mıştı ki, -er -mez',
      word_type: 'Bağlaç (Zaman)',
      synonyms: 'barely ... when, no sooner ... than',
      example: 'Scarcely had the surgeon completed the procedure when the patient showed signs of rapid physiological recovery.',
      notes: 'Devrik cümle (inversion) ile kullanılan en popüler YÖKDİL zaman bağlacıdır.',
      difficulty: 3
    },
    {
      english: 'in accordance with',
      turkish: '-e uygun olarak, -e göre, doğrultusunda',
      word_type: 'Bağlaç (Uygunluk / Referans)',
      synonyms: 'according to, in line with, complying with',
      example: 'All clinical trials must be conducted strictly in accordance with international ethical guidelines.',
      notes: 'Kurallar, yasalar ve standartlarla uyumu belirtmek için kullanılır.',
      difficulty: 2
    },
    {
      english: 'by virtue of / on account of',
      turkish: '-den dolayı, sayesinde, yüzünden',
      word_type: 'Bağlaç (Neden-Sonuç)',
      synonyms: 'by means of, because of, thanks to',
      example: 'He achieved remarkable success in his academic career by virtue of sheer dedication and innovative research methods.',
      notes: 'Hem olumlu (sayesinde) hem de nötr neden bildirimi yapabilir.',
      difficulty: 3
    },
    {
      english: 'in compliance with',
      turkish: '-e riayet ederek, kurallara uygun olarak',
      word_type: 'Bağlaç (Uygunluk)',
      synonyms: 'in accordance with, observing',
      example: 'The pharmaceutical company upgraded its disposal systems in compliance with newly enacted environmental regulations.',
      notes: 'Özellikle yasal yükümlülükler ve denetim metinlerinde geçer.',
      difficulty: 2
    },
    {
      english: 'for fear that / for fear of',
      turkish: 'korkusuyla, endişesiyle',
      word_type: 'Bağlaç (Neden / Önlem)',
      synonyms: 'lest, because of apprehension about',
      example: 'The government avoided imposing sudden tax increases for fear that they might trigger widespread social unrest.',
      notes: 'Olası olumsuz bir durumdan kaçınmak için yapılan eylemi açıklar.',
      difficulty: 2
    },
    {
      english: 'as well as',
      turkish: 'hem de, -e ek olarak, yanı sıra',
      word_type: 'Bağlaç (Ekleme)',
      synonyms: 'in addition to, along with, besides',
      example: 'Vitamin C contributes to the maintenance of healthy skin and blood vessels as well as strengthening the immune system.',
      notes: 'Hem isimleri hem de fiilimsi (Ving) yapıları birbirine bağlar.',
      difficulty: 1
    },
    {
      english: 'on the grounds that',
      turkish: 'gerekçesiyle, dayanağıyla, -dığı için',
      word_type: 'Bağlaç (Neden-Sonuç)',
      synonyms: 'on the basis that, because, since',
      example: 'The judge dismissed the lawsuit on the grounds that the evidence presented was entirely circumstantial and unverified.',
      notes: 'Resmi gerekçe ve hukuki/bilimsel dayanak sunarken tercih edilir.',
      difficulty: 3
    },
    {
      english: 'in the absence of',
      turkish: 'yokluğunda, bulunmadığı durumda',
      word_type: 'Bağlaç (Koşul / Durum)',
      synonyms: 'without, lacking',
      example: 'In the absence of sunlight, deep-sea organisms rely on chemosynthesis rather than photosynthesis to produce energy.',
      notes: 'Bir etkenin eksikliğinde ortaya çıkan alternatif durumu veya sorunu anlatır.',
      difficulty: 2
    },
    {
      english: 'so as to / in order to',
      turkish: '-mek için, amacıyla (fiil alır)',
      word_type: 'Bağlaç (Amaç)',
      synonyms: 'to, with the aim of, for the purpose of',
      example: 'The telescope was placed on a high mountain summit so as to minimize atmospheric distortion of incoming starlight.',
      notes: 'Kendinden sonra daima yalın halde fiil (V1) alır.',
      difficulty: 1
    },
    {
      english: 'instead of / in place of',
      turkish: '-in yerine, onun yerine',
      word_type: 'Bağlaç (Alternatif)',
      synonyms: 'rather than, as a substitute for',
      example: 'Modern electric vehicles utilize lithium-ion battery packs instead of traditional internal combustion engines.',
      notes: 'İki seçenekten birinin diğerine tercih edildiğini gösterir.',
      difficulty: 1
    },
    {
      english: 'rather than',
      turkish: '-den ziyade, -mektense',
      word_type: 'Bağlaç (Tercih / Alternatif)',
      synonyms: 'instead of, more than',
      example: 'The therapy focuses on managing chronic symptoms rather than attempting a risky surgical cure.',
      notes: 'Cümle içinde hem fiil (Ving/V1) hem de isim öbeklerini karşılaştırabilir.',
      difficulty: 2
    },
    {
      english: 'on behalf of',
      turkish: 'adına, namına, temsilen',
      word_type: 'Bağlaç (Temsil)',
      synonyms: 'in the name of, representing',
      example: 'The lead scientist accepted the prestigious Nobel Prize on behalf of her entire interdisciplinary research team.',
      notes: 'Bir kişi veya grubun temsilcisi olarak yapılan eylemlerde geçer.',
      difficulty: 2
    },
    {
      english: 'in view of / considering',
      turkish: 'göz önüne alındığında, -den dolayı',
      word_type: 'Bağlaç (Neden / Değerlendirme)',
      synonyms: 'bearing in mind, in light of, given',
      example: 'In view of the rapidly rising infection rates, the ministry issued new public health guidelines across all provinces.',
      notes: 'Mevcut bir veri veya duruma dayanarak alınan kararları açıklar.',
      difficulty: 2
    },
    {
      english: 'by means of / through',
      turkish: 'vasıtasıyla, yoluyla, aracılığıyla',
      word_type: 'Bağlaç (Yöntem / Araç)',
      synonyms: 'via, using, by way of',
      example: 'Plants absorb vital soil minerals by means of specialized root hair structures.',
      notes: 'Bir eylemin hangi teknik veya mekanizma ile gerçekleştiğini belirtir.',
      difficulty: 2
    },
    {
      english: 'for the sake of',
      turkish: 'uğruna, hatırına, -in selameti için',
      word_type: 'Bağlaç (Amaç)',
      synonyms: 'in the interest of, for the benefit of',
      example: 'The factory suspended its heavy chemical emissions for the sake of preserving local groundwater purity.',
      notes: 'Koruma veya fayda sağlama amacı taşır.',
      difficulty: 2
    },
    {
      english: 'in the wake of / following',
      turkish: '-in ardından, hemen sonrasında, akabinde',
      word_type: 'Bağlaç (Zaman / Neden-Sonuç)',
      synonyms: 'as a consequence of, right after',
      example: 'In the wake of the devastating tsunami, international relief organizations dispatched emergency medical supplies instantly.',
      notes: 'Genellikle büyük veya önemli bir olayın ardından gelen etkileri tanımlar.',
      difficulty: 3
    },
    {
      english: 'with respect to / regarding',
      turkish: '-e gelince, ile ilgili olarak, bakımından',
      word_type: 'Bağlaç (Referans / Konu)',
      synonyms: 'in terms of, concerning, pertaining to',
      example: 'The two biological samples show remarkable similarity with respect to their genetic sequence and cellular structure.',
      notes: 'Bir karşılaştırma veya açıklamanın hangi açıda/alandan yapıldığını belirtir.',
      difficulty: 2
    },
    {
      english: 'as opposed to / in contrast to',
      turkish: '-in aksine, -e kıyasla',
      word_type: 'Bağlaç (Karşılaştırma / Zıtlık)',
      synonyms: 'unlike, contrary to',
      example: 'Reptiles are cold-blooded vertebrates, as opposed to mammals and birds which can regulate their own body temperatures.',
      notes: 'İki kategorinin temel bir farkını ön plana çıkarır.',
      difficulty: 2
    },
    {
      english: 'contrary to / unlike',
      turkish: 'aksine, -in tersine',
      word_type: 'Bağlaç (Zıtlık)',
      synonyms: 'in opposition to, against',
      example: 'Contrary to popular belief, bats are not blind and possess excellent echolocation abilities.',
      notes: 'Yaygın bir inancın veya beklentinin tersi olan bilimsel gerçekleri sunarken kullanılır.',
      difficulty: 1
    },
    {
      english: 'with a view to / with the aim of',
      turkish: 'amacıyla, niyetiyle (Ving alır)',
      word_type: 'Bağlaç (Amaç)',
      synonyms: 'for the purpose of, intending to',
      example: 'The city council expanded the metro network with a view to reducing daily traffic congestion in the commercial district.',
      notes: 'Dikkat! With a view TO ifadesindeki to bir edattır (preposition), bu yüzden arkasından yalın fiil değil Ving gelir.',
      difficulty: 3
    },
    {
      english: 'in the event of / in case of',
      turkish: '-durumunda, halinde (isim alır)',
      word_type: 'Bağlaç (Koşul)',
      synonyms: 'if there is, in the situation of',
      example: 'In the event of a chemical spill, all personnel must evacuate the laboratory immediately using designated fire exits.',
      notes: 'Acil durum, kaza veya olasılık bildiren isim öbekleriyle kullanılır.',
      difficulty: 2
    },
    {
      english: 'as regards / as far as ... is concerned',
      turkish: '-e gelince, -le alakalı olarak',
      word_type: 'Bağlaç (Konu Girişi)',
      synonyms: 'concerning, regarding, with respect to',
      example: 'As regards energy consumption, LED bulbs are significantly more efficient than incandescent lamps.',
      notes: 'Cümle başlarında yeni bir konuya veya parametreye geçerken kullanılır.',
      difficulty: 2
    },
    {
      english: 'on the verge of / on the brink of',
      turkish: 'eşiğinde, -mek üzere, kıyısında',
      word_type: 'Bağlaç (Zaman / Durum)',
      synonyms: 'about to, on the threshold of',
      example: 'Several species of tropical amphibians are currently on the verge of extinction due to rapid habitat destruction.',
      notes: 'Çok yakın bir gelecekte gerçekleşmesi an meselesi olan kritik durumları ifade eder.',
      difficulty: 3
    },
    {
      english: 'thanks to / owing to',
      turkish: 'sayesinde, -in katkısıyla',
      word_type: 'Bağlaç (Olumlu Neden-Sonuç)',
      synonyms: 'due to, by virtue of',
      example: 'Thanks to advancements in robotic surgery, patients now experience significantly faster post-operative recovery times.',
      notes: 'Genellikle olumlu ve faydalı bir sebebe atıfta bulunurken tercih edilir.',
      difficulty: 1
    },
    {
      english: 'in the face of / confronted with',
      turkish: 'karşısında, rağmen, karşı karşıya kalındığında',
      word_type: 'Bağlaç (Durum / Zıtlık)',
      synonyms: 'when facing, despite, dealing with',
      example: 'The research team maintained their optimism and continued testing in the face of repeated experimental failures.',
      notes: 'Zorluk, tehdit veya engel durumları karşısında gösterilen tutumu anlatır.',
      difficulty: 3
    },
    {
      english: 'to the extent that',
      turkish: '-derecede, o kadar ki, -boyutunda',
      word_type: 'Bağlaç (Derece / Ölçü)',
      synonyms: 'in so far as, up to the point where',
      example: 'The Arctic permafrost is thawing to the extent that ancient methane gas trapped for millennia is being released into the atmosphere.',
      notes: 'Bir olayın sebep olduğu etkinin şiddetini ve boyutunu vurgular.',
      difficulty: 3
    },
    {
      english: 'short of / barring',
      turkish: 'olmadıkça, haricinde, -meksizin',
      word_type: 'Bağlaç (Koşul / İstisna)',
      synonyms: 'without, unless there is, except for',
      example: 'Short of a total overhaul of our industrial infrastructure, achieving zero carbon emissions within a decade is unlikely.',
      notes: 'Çok olağanüstü bir müdahale veya istisna gerçekleşmedikçe anlamı verir.',
      difficulty: 3
    },
    {
      english: 'save for / except for',
      turkish: 'haricinde, dışında, istisna olarak',
      word_type: 'Bağlaç (İstisna)',
      synonyms: 'excluding, aside from, other than',
      example: 'The patient felt no discomfort save for a mild headache during the first two hours following the vaccination.',
      notes: 'Genel bir durumdan tek bir istisnayı ayırırken kullanılır.',
      difficulty: 3
    },
    {
      english: 'apart from / aside from',
      turkish: 'dışında, haricinde / ek olarak',
      word_type: 'Bağlaç (İstisna / Ekleme)',
      synonyms: 'besides, except for, other than',
      example: 'Apart from a slight increase in heart rate, the medication produced no noticeable physiological changes.',
      notes: 'Cümle bağlamına göre hem ekleme (hem de) hem istisna (dışında) anlamı taşıyabilir.',
      difficulty: 2
    },
    {
      english: 'by far / undoubtedly',
      turkish: 'açık ara, tartışmasız şekilde',
      word_type: 'Zarf / Bağlayıcı (Vurgu)',
      synonyms: 'by a large margin, easily, unquestionably',
      example: 'Malaria is by far the most lethal vector-borne disease affecting populations in sub-Saharan Africa.',
      notes: 'Superlative (en üstünlük) derecelerini (the most, the biggest) kuvvetlendirmek için kullanılır.',
      difficulty: 2
    },
    {
      english: 'by and large / on the whole',
      turkish: 'genel olarak, genel anlamda',
      word_type: 'Zarf / Bağlayıcı (Genelleme)',
      synonyms: 'in general, generally speaking, mainly',
      example: 'By and large, mammals give birth to live offspring and nourish them with milk produced by mammary glands.',
      notes: 'Ufak istisnalar olmakla birlikte durumun genelde doğru olduğunu vurgular.',
      difficulty: 2
    },
    {
      english: 'in brief / in summary',
      turkish: 'kısaca, özetle, sözün özü',
      word_type: 'Zarf / Bağlayıcı (Özet)',
      synonyms: 'to sum up, briefly, in short',
      example: 'In brief, the study confirms that regular physical exercise significantly delays the onset of neurodegenerative disorders.',
      notes: 'Akademik makalelerin sonuç ve özet bölümlerinde kullanılır.',
      difficulty: 1
    },
    {
      english: 'that is to say / namely',
      turkish: 'yani, başka bir deyişle, şöyle ki',
      word_type: 'Bağlaç (Açıklama / Netleştirme)',
      synonyms: 'in other words, specifically, i.e.',
      example: 'The organism is autotrophic; that is to say, it is capable of synthesizing its own food from inorganic substances.',
      notes: 'Önceki cümlede söylenen teknik veya karmaşık bir terimi daha net ve açık ifadeyle tanımlarken kullanılır.',
      difficulty: 2
    },
    {
      english: 'for instance / for example',
      turkish: 'örneğin, misal olarak',
      word_type: 'Bağlaç (Örnekleme)',
      synonyms: 'to illustrate, such as, e.g.',
      example: 'Heavy metals can accumulate in aquatic food chains; for instance, mercury levels are exceptionally high in predatory fish like tuna.',
      notes: 'Genel bir önermeye somut bilimsel kanıt ve örnek sunar.',
      difficulty: 1
    },
    {
      english: 'alike / similarly',
      turkish: 'aynı şekilde, hem ... hem de',
      word_type: 'Zarf / Bağlayıcı (Benzerlik)',
      synonyms: 'equally, in the same way',
      example: 'Extreme climate fluctuations pose a severe survival challenge to plants and animals alike across alpine ecosystems.',
      notes: 'İki grup veya nesnenin eşit derecede etkilendiğini belirtmek için kullanılır.',
      difficulty: 2
    },
    {
      english: 'at all costs / no matter what',
      turkish: 'ne pahasına olursa olsun, her halükarda',
      word_type: 'Zarf / Bağlayıcı (Vurgu)',
      synonyms: 'by any means necessary, absolutely',
      example: 'Contamination of the sterile biological samples must be prevented at all costs during the transportation phase.',
      notes: 'Mutlak zorunluluk ve taviz verilmemesi gereken kuralları belirtir.',
      difficulty: 2
    },
    {
      english: 'to put it another way / in other words',
      turkish: 'başka bir ifadeyle, yani',
      word_type: 'Bağlaç (Yeniden İfade Etme)',
      synonyms: 'that is to say, simply put',
      example: 'The enzyme lowers the activation energy required for the reaction; to put it another way, it allows the chemical change to occur much faster.',
      notes: 'Bilimsel bir mekanizmayı daha anlaşılır kelimelerle özetler.',
      difficulty: 2
    },
    {
      english: 'so as not to / lest',
      turkish: '-memek için, olmasın diye',
      word_type: 'Bağlaç (Olumsuz Amaç)',
      synonyms: 'in order not to, to avoid -ing',
      example: 'The surgeon handled the neural tissue with extreme precision so as not to cause permanent motor impairment.',
      notes: 'Bir zarardan veya hatadan kaçınma amacıyla yapılan özenli eylemi anlatır.',
      difficulty: 2
    }
  ]
}
