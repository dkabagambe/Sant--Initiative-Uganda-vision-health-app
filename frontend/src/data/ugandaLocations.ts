// Uganda Districts → Counties → Sub-counties → Parishes
// Flat lookup maps for efficient cascading dropdowns

// District → Counties
const districtCounties: Record<string, string[]> = {
  "Abim": ["Labwor County"],
  "Adjumani": ["Adjumani East County", "Adjumani West County"],
  "Agago": ["Agago County", "Agago North County"],
  "Alebtong": ["Alebtong County", "Moroto County"],
  "Amolatar": ["Amolatar County", "Kioga County"],
  "Amudat": ["Amudat County", "Karita County"],
  "Amuria": ["Amuria County", "Kapelebyong County"],
  "Amuru": ["Amuru County", "Kilak North County"],
  "Apac": ["Maruzi County", "Maruzi North County"],
  "Arua": ["Arua Central Division", "Ayivu County", "Vurra County"],
  "Budaka": ["Budaka County", "Iki-Iki County"],
  "Bududa": ["Bududa County", "Manjiya County"],
  "Bugiri": ["Bukooli Central County", "Bukooli North County", "Bukooli South County"],
  "Bugweri": ["Bugweri County", "Bugweri South County"],
  "Buhweju": ["Buhweju County"],
  "Buikwe": ["Buikwe County North", "Buikwe County South"],
  "Bukedea": ["Bukedea County"],
  "Bukomansimbi": ["Bukomansimbi County", "Bukomansimbi South County"],
  "Bukwo": ["Bukwo County", "Kongasis County"],
  "Bulambuli": ["Bulambuli County", "Elgon County"],
  "Buliisa": ["Buliisa County"],
  "Bundibugyo": ["Bwamba County", "Bughendera County"],
  "Bunyangabu": ["Bunyangabu County"],
  "Bushenyi": ["Igara County East", "Igara County West"],
  "Busia": ["Samia-Bugwe County North", "Samia-Bugwe County South"],
  "Butaleja": ["Bunyole County East", "Bunyole County West"],
  "Butambala": ["Butambala County"],
  "Butebo": ["Butebo County"],
  "Buvuma": ["Buvuma County"],
  "Buyende": ["Buyende County", "Budiope East County"],
  "Dokolo": ["Dokolo County", "Dokolo North County"],
  "Gomba": ["Gomba County", "Gomba East County"],
  "Gulu": ["Aswa County", "Omoro County"],
  "Hoima": ["Bugahya County", "Buhaguzi County"],
  "Ibanda": ["Ibanda County North", "Ibanda County South"],
  "Iganga": ["Kigulu County North", "Kigulu County South"],
  "Isingiro": ["Bukanga County", "Isingiro County North", "Isingiro County South"],
  "Jinja": ["Butembe County", "Kagoma County"],
  "Kaabong": ["Dodoth East County", "Dodoth West County"],
  "Kabale": ["Ndorwa County East", "Ndorwa County West"],
  "Kabarole": ["Burahya County"],
  "Kaberamaido": ["Kaberamaido County"],
  "Kagadi": ["Buyaga County East", "Buyaga County West"],
  "Kakumiro": ["Kakumiro County", "Bugangaizi County"],
  "Kalangala": ["Bujumba County", "Kyamuswa County"],
  "Kaliro": ["Bulamogi County", "Bulamogi North County"],
  "Kalungu": ["Kalungu County East", "Kalungu County West"],
  "Kampala": ["Central Division", "Kawempe Division", "Makindye Division", "Nakawa Division", "Rubaga Division"],
  "Kamuli": ["Bugabula County North", "Bugabula County South", "Buzaaya County"],
  "Kamwenge": ["Kamwenge County", "Kibale County"],
  "Kanungu": ["Kinkizi County East", "Kinkizi County West"],
  "Kapchorwa": ["Tingey County"],
  "Kapelebyong": ["Kapelebyong County"],
  "Karenga": ["Karenga County"],
  "Kasanda": ["Kasanda County North", "Kasanda County South"],
  "Kasese": ["Bukonzo County East", "Bukonzo County West", "Busongora County North", "Busongora County South"],
  "Katakwi": ["Katakwi County", "Toroma County"],
  "Kayunga": ["Baale County", "Ntenjeru County North", "Ntenjeru County South"],
  "Kazo": ["Kazo County"],
  "Kibaale": ["Bugangaizi County East", "Bugangaizi County West", "Buyanja County"],
  "Kiboga": ["Kiboga County East", "Kiboga County West"],
  "Kibuku": ["Kibuku County"],
  "Kikuube": ["Buhaguzi County", "Kikuube County"],
  "Kiruhura": ["Nyabushozi County"],
  "Kiryandongo": ["Kibanda County", "Kibanda North County"],
  "Kisoro": ["Bufumbira County East", "Bufumbira County South"],
  "Kitagwenda": ["Kitagwenda County"],
  "Kitgum": ["Chua County East", "Chua County West"],
  "Koboko": ["Koboko County", "Aringa County"],
  "Kole": ["Kole County", "Kole North County"],
  "Kotido": ["Jie County", "Labwor County"],
  "Kumi": ["Kumi County"],
  "Kwania": ["Kwania County", "Kwania North County"],
  "Kween": ["Kween County"],
  "Kyankwanzi": ["Kyankwanzi County", "Ntwetwe County"],
  "Kyegegwa": ["Kyaka County", "Kyegegwa County"],
  "Kyenjojo": ["Kyenjojo County", "Mwenge County North", "Mwenge County South"],
  "Kyotera": ["Kyotera County", "Kakuuto County"],
  "Lamwo": ["Lamwo County"],
  "Lira": ["Erute County North", "Erute County South"],
  "Luuka": ["Luuka County North", "Luuka County South"],
  "Luwero": ["Bamunanika County", "Katikamu County North", "Katikamu County South"],
  "Lwengo": ["Lwengo County", "Lwengo South County"],
  "Lyantonde": ["Lyantonde County", "Kabula County"],
  "Madi-Okollo": ["Madi-Okollo County", "Okollo County"],
  "Manafwa": ["Bubulo County East", "Bubulo County West"],
  "Maracha": ["Maracha County", "Maracha East County"],
  "Masaka": ["Bukoto County East", "Bukoto County West"],
  "Masindi": ["Bujenje County", "Buruli County"],
  "Mayuge": ["Bunya County East", "Bunya County South", "Bunya County West"],
  "Mbale": ["Bungokho County North", "Bungokho County South"],
  "Mbarara": ["Kashari County North", "Kashari County South"],
  "Mitooma": ["Ruhinda County North", "Ruhinda County South"],
  "Mityana": ["Mityana County North", "Mityana County South"],
  "Moroto": ["Matheniko County"],
  "Moyo": ["Moyo County", "West Moyo County"],
  "Mpigi": ["Mawokota County North", "Mawokota County South"],
  "Mubende": ["Buwekula County", "Kasambya County"],
  "Mukono": ["Mukono County North", "Mukono County South", "Nakifuma County"],
  "Nabilatuk": ["Nabilatuk County"],
  "Nakapiripirit": ["Chekwii County", "Kadam County"],
  "Nakaseke": ["Nakaseke County North", "Nakaseke County South"],
  "Nakasongola": ["Budyebo County", "Nakasongola County"],
  "Namayingo": ["Namayingo County North", "Namayingo County South"],
  "Namisindwa": ["Namisindwa County", "Bubulo East County"],
  "Namutumba": ["Busiki County North", "Busiki County South"],
  "Napak": ["Bokora County"],
  "Nebbi": ["Jonam County", "Padyere County"],
  "Ngora": ["Ngora County"],
  "Ntoroko": ["Ntoroko County"],
  "Ntungamo": ["Kajara County", "Ruhaama County", "Rushenyi County"],
  "Nwoya": ["Nwoya County"],
  "Obongi": ["Obongi County"],
  "Omoro": ["Omoro County"],
  "Otuke": ["Otuke County"],
  "Oyam": ["Oyam County North", "Oyam County South"],
  "Pader": ["Aruu County North", "Aruu County South"],
  "Pakwach": ["Pakwach County", "Jonam County"],
  "Pallisa": ["Pallisa County", "Kibale County", "Butebo County"],
  "Rakai": ["Kooki County", "Kyotera County"],
  "Rubanda": ["Rubanda County East", "Rubanda County West"],
  "Rubirizi": ["Bunyaruguru County"],
  "Rukiga": ["Rukiga County"],
  "Rukungiri": ["Rubabo County", "Rujumbura County"],
  "Rwampara": ["Rwampara County East", "Rwampara County West"],
  "Sembabule": ["Lwemiyaga County", "Mawogola County North", "Mawogola County South"],
  "Serere": ["Serere County", "Kasilo County"],
  "Sheema": ["Sheema County North", "Sheema County South"],
  "Sironko": ["Budadiri County East", "Budadiri County West"],
  "Soroti": ["Soroti County"],
  "Tororo": ["Tororo County North", "Tororo County South", "West Budama County North", "West Budama County South"],
  "Wakiso": ["Busiro County East", "Busiro County South", "Kyadondo County East", "Kyadondo County South", "Nansana Municipality"],
  "Yumbe": ["Aringa County North", "Aringa County South"],
  "Zombo": ["Okoro County", "Zombo County"],
};

// County → Sub-Counties
const countySubCounties: Record<string, string[]> = {
  // Abim
  "Labwor County": ["Abim Sub-County", "Abim Town Council", "Alerek Sub-County", "Lotuke Sub-County", "Morulem Sub-County", "Nyakwae Sub-County"],
  // Adjumani
  "Adjumani East County": ["Adropi Sub-County", "Ciforo Sub-County", "Itirikwa Sub-County", "Pachara Sub-County"],
  "Adjumani West County": ["Arinyapi Sub-County", "Dzaipi Sub-County", "Ofua Sub-County", "Ukusijoni Sub-County"],
  // Agago
  "Agago County": ["Adilang Sub-County", "Arum Sub-County", "Kotomor Sub-County", "Lamiyo Sub-County", "Lokole Sub-County", "Omot Sub-County"],
  "Agago North County": ["Lira Palwo Sub-County", "Parabongo Sub-County", "Patongo Sub-County", "Patongo Town Council", "Wol Sub-County"],
  // Alebtong
  "Alebtong County": ["Alebtong Sub-County", "Alebtong Town Council", "Aloi Sub-County", "Apala Sub-County", "Awei Sub-County"],
  "Moroto County": ["Abako Sub-County", "Amugu Sub-County", "Omoro Sub-County"],
  // Amolatar
  "Amolatar County": ["Agikdak Sub-County", "Amolatar Town Council", "Awelo Sub-County", "Muntu Sub-County", "Namasale Sub-County", "Namasale Town Council"],
  "Kioga County": ["Agwingiri Sub-County", "Aputi Sub-County", "Etam Sub-County"],
  // Amudat
  "Amudat County": ["Amudat Sub-County", "Amudat Town Council", "Loroo Sub-County"],
  "Karita County": ["Karita Sub-County", "Kapetokol Sub-County"],
  // Amuria
  "Amuria County": ["Abarilela Sub-County", "Acowa Sub-County", "Amuria Town Council", "Kuju Sub-County", "Morungatuny Sub-County", "Obalanga Sub-County", "Wera Sub-County"],
  "Kapelebyong County": ["Kapelebyong Sub-County", "Kapelebyong Town Council"],
  // Amuru
  "Amuru County": ["Amuru Sub-County", "Amuru Town Council", "Atiak Sub-County", "Atiak Town Council", "Bibia Sub-County", "Lamogi Sub-County", "Pabbo Sub-County"],
  "Kilak North County": ["Lakang Sub-County", "Lamogi Sub-County"],
  // Apac
  "Maruzi County": ["Abongomola Sub-County", "Aduku Sub-County", "Aduku Town Council", "Akokoro Sub-County", "Apac Municipality", "Chegere Sub-County", "Ibuje Sub-County", "Nambieso Sub-County"],
  "Maruzi North County": ["Chawente Sub-County", "Inomo Sub-County", "Apac Town Council"],
  // Arua
  "Arua Central Division": ["Arua Hill Division", "River Oli Division"],
  "Ayivu County": ["Adumi Sub-County", "Aroi Sub-County", "Dadamu Sub-County", "Manibe Sub-County", "Oluko Sub-County", "Pajulu Sub-County"],
  "Vurra County": ["Ajia Sub-County", "Logiri Sub-County", "Offaka Sub-County", "Ogoko Sub-County", "Onduparaka Sub-County"],
  // Budaka
  "Budaka County": ["Budaka Sub-County", "Budaka Town Council", "Kamonkoli Sub-County", "Kameruka Sub-County"],
  "Iki-Iki County": ["Iki-Iki Sub-County", "Iki-Iki Town Council", "Kachonga Sub-County", "Lyama Sub-County"],
  // Bududa
  "Bududa County": ["Bududa Sub-County", "Bududa Town Council", "Bukigai Sub-County", "Bukalasi Sub-County", "Bushika Sub-County"],
  "Manjiya County": ["Bulucheke Sub-County", "Bumayoka Sub-County", "Buwali Sub-County", "Nalwanza Sub-County"],
  // Bugiri
  "Bukooli Central County": ["Bugiri Municipality", "Bugiri Sub-County", "Kapyanga Sub-County", "Nabukalu Sub-County"],
  "Bukooli North County": ["Buwunga Sub-County", "Iwemba Sub-County", "Muterere Sub-County", "Nankoma Sub-County"],
  "Bukooli South County": ["Bulidha Sub-County", "Busakira Sub-County", "Buyinja Sub-County", "Naluwerere Sub-County"],
  // Bugweri
  "Bugweri County": ["Bugweri Sub-County", "Idudi Sub-County", "Iganga Municipality", "Nakalama Sub-County"],
  "Bugweri South County": ["Busesa Sub-County", "Ibulanku Sub-County", "Makuutu Sub-County"],
  // Buhweju
  "Buhweju County": ["Bihanga Sub-County", "Bitsya Sub-County", "Engaju Sub-County", "Karungu Sub-County", "Nsiika Sub-County"],
  // Buikwe
  "Buikwe County North": ["Buikwe Sub-County", "Buikwe Town Council", "Najjembe Sub-County", "Ngogwe Sub-County", "Nkokonjeru Town Council", "Ssi-Bukunja Sub-County"],
  "Buikwe County South": ["Lugazi Municipality", "Najja Sub-County", "Nyenga Sub-County", "Wakisi Sub-County"],
  // Bukedea
  "Bukedea County": ["Bukedea Sub-County", "Bukedea Town Council", "Kachumbala Sub-County", "Kamutur Sub-County", "Kolir Sub-County", "Malera Sub-County"],
  // Bukomansimbi
  "Bukomansimbi County": ["Bigasa Sub-County", "Bukomansimbi Sub-County", "Bukomansimbi Town Council", "Kibinge Sub-County"],
  "Bukomansimbi South County": ["Butenga Sub-County", "Kitanda Sub-County"],
  // Bukwo
  "Bukwo County": ["Bukwo Sub-County", "Bukwo Town Council", "Chesower Sub-County", "Kabei Sub-County", "Kaptererwo Sub-County"],
  "Kongasis County": ["Chepkwasta Sub-County", "Kongasis Sub-County", "Riwo Sub-County", "Suam Sub-County"],
  // Bulambuli
  "Bulambuli County": ["Bulambuli Sub-County", "Bulambuli Town Council", "Bulegeni Sub-County", "Bwikhonge Sub-County", "Sisiyi Sub-County"],
  "Elgon County": ["Bubiita Sub-County", "Buginyanya Sub-County", "Bumufuni Sub-County", "Lusha Sub-County", "Muyembe Sub-County"],
  // Buliisa
  "Buliisa County": ["Biiso Sub-County", "Buliisa Sub-County", "Buliisa Town Council", "Butiaba Sub-County", "Kigwera Sub-County", "Ngwedo Sub-County"],
  // Bundibugyo
  "Bwamba County": ["Bubandi Sub-County", "Bundibugyo Town Council", "Busaru Sub-County", "Harugale Sub-County", "Ndugutu Sub-County"],
  "Bughendera County": ["Bumate Sub-County", "Kasitu Sub-County", "Kirumya Sub-County", "Mirambi Sub-County", "Ntotoro Sub-County"],
  // Bunyangabu
  "Bunyangabu County": ["Bunyangabu Sub-County", "Hapuuyo Sub-County", "Kicece Sub-County", "Kisomoro Sub-County", "Mugusu Sub-County"],
  // Bushenyi
  "Igara County East": ["Bushenyi-Ishaka Municipality", "Kakanju Sub-County", "Kyabugimbi Sub-County", "Nyabubare Sub-County"],
  "Igara County West": ["Bumbaire Sub-County", "Ibaare Sub-County", "Kyamuhunga Sub-County", "Shuuku Municipality"],
  // Busia
  "Samia-Bugwe County North": ["Busia Municipality", "Bulumbi Sub-County", "Dabani Sub-County", "Masafu Sub-County"],
  "Samia-Bugwe County South": ["Buteba Sub-County", "Lunyo Sub-County", "Majanji Sub-County", "Lumino Sub-County"],
  // Butaleja
  "Bunyole County East": ["Busolwe Sub-County", "Busolwe Town Council", "Butaleja Sub-County", "Butaleja Town Council", "Mazimasa Sub-County"],
  "Bunyole County West": ["Himutu Sub-County", "Kachonga Sub-County", "Nawanjofu Sub-County", "Naweyo Sub-County"],
  // Butambala
  "Butambala County": ["Budde Sub-County", "Butambala Sub-County", "Gombe Sub-County", "Gombe Town Council", "Kalamba Sub-County", "Ngando Sub-County"],
  // Butebo
  "Butebo County": ["Butebo Sub-County", "Butebo Town Council", "Kabwangasi Sub-County", "Kakoro Sub-County", "Kanyumu Sub-County"],
  // Buvuma
  "Buvuma County": ["Busamuzi Sub-County", "Buvuma Sub-County", "Buvuma Town Council", "Buwooya Sub-County", "Nairambi Sub-County"],
  // Buyende
  "Buyende County": ["Bugaya Sub-County", "Buyende Sub-County", "Buyende Town Council", "Kagulu Sub-County", "Nkondo Sub-County"],
  "Budiope East County": ["Irundu Sub-County", "Kidera Sub-County", "Kidera Town Council", "Nkondo Sub-County"],
  // Dokolo
  "Dokolo County": ["Agwata Sub-County", "Bata Sub-County", "Dokolo Sub-County", "Dokolo Town Council", "Kangai Sub-County"],
  "Dokolo North County": ["Adeknino Sub-County", "Amwoma Sub-County", "Okwongodul Sub-County"],
  // Gomba
  "Gomba County": ["Gomba Sub-County", "Kanoni Sub-County", "Kanoni Town Council", "Kabulasoke Sub-County", "Maddu Sub-County"],
  "Gomba East County": ["Kyegonza Sub-County", "Mpenja Sub-County", "Buwama Sub-County"],
  // Gulu
  "Aswa County": ["Awach Sub-County", "Bungatira Sub-County", "Lakwana Sub-County", "Laroo-Pece Division", "Layibi-Bardege Division", "Patiko Sub-County", "Unyama Sub-County"],
  "Omoro County": ["Bobi Sub-County", "Koro Sub-County", "Lalogi Sub-County", "Odek Sub-County"],
  // Hoima
  "Bugahya County": ["Buhanika Sub-County", "Bugambe Sub-County", "Buhimba Sub-County", "Hoima Municipality", "Kigorobya Sub-County", "Kigorobya Town Council", "Kitoba Sub-County"],
  "Buhaguzi County": ["Buseruka Sub-County", "Kabwoya Sub-County", "Kyabigambire Sub-County", "Kyangwali Sub-County"],
  // Ibanda
  "Ibanda County North": ["Ibanda Municipality", "Ishongororo Sub-County", "Katabazi Sub-County", "Nyarukiika Sub-County"],
  "Ibanda County South": ["Bisheshe Sub-County", "Igorora Sub-County", "Igorora Town Council", "Kagongo Sub-County", "Keihangara Sub-County", "Ruyonza Sub-County"],
  // Iganga
  "Kigulu County North": ["Iganga Municipality", "Ibulanku Sub-County", "Nakigo Sub-County", "Nakalama Sub-County"],
  "Kigulu County South": ["Bulamogi Sub-County", "Buyanga Sub-County", "Namungalwe Sub-County", "Nawandala Sub-County"],
  // Isingiro
  "Bukanga County": ["Birere Sub-County", "Endiinzi Sub-County", "Kabingo Sub-County", "Kabuyanda Sub-County", "Kabuyanda Town Council", "Rushasha Sub-County"],
  "Isingiro County North": ["Isingiro Sub-County", "Isingiro Town Council", "Mbaare Sub-County", "Nyakitunda Sub-County"],
  "Isingiro County South": ["Kabaare Sub-County", "Ngarama Sub-County", "Ngarama Town Council", "Rugaaga Sub-County"],
  // Jinja
  "Butembe County": ["Bugembe Town Council", "Buwenge Sub-County", "Buwenge Town Council", "Kakira Sub-County", "Mafubira Sub-County"],
  "Kagoma County": ["Budondo Sub-County", "Buyengo Sub-County", "Jinja Central Division", "Jinja North Division", "Jinja South Division"],
  // Kaabong
  "Dodoth East County": ["Kaabong Sub-County", "Kaabong Town Council", "Kalapata Sub-County", "Kathile Sub-County", "Lolelia Sub-County"],
  "Dodoth West County": ["Karenga Sub-County", "Kapedo Sub-County", "Loyoro Sub-County", "Sidok Sub-County"],
  // Kabale
  "Ndorwa County East": ["Buhara Sub-County", "Kabale Municipality", "Kaharo Sub-County", "Kamuganguzi Sub-County", "Kyanamira Sub-County"],
  "Ndorwa County West": ["Bukinda Sub-County", "Hamurwa Sub-County", "Ikumba Sub-County", "Kitumba Sub-County", "Maziba Sub-County", "Rubaya Sub-County"],
  // Kabarole
  "Burahya County": ["Fort Portal Tourism City", "Bukuku Sub-County", "Busoro Sub-County", "Hakibale Sub-County", "Kabende Sub-County", "Karambi Sub-County", "Kicwamba Sub-County", "Mugusu Sub-County", "Rwimi Sub-County", "Rwimi Town Council"],
  // Kaberamaido
  "Kaberamaido County": ["Alwa Sub-County", "Kaberamaido Sub-County", "Kaberamaido Town Council", "Kalaki Sub-County", "Kobulubulu Sub-County", "Otuboi Sub-County", "Otuboi Town Council"],
  // Kagadi
  "Buyaga County East": ["Kagadi Sub-County", "Kagadi Town Council", "Mabaale Sub-County", "Muhorro Sub-County", "Muhorro Town Council", "Ndaiga Sub-County"],
  "Buyaga County West": ["Bwikara Sub-County", "Itwara Sub-County", "Kakindo Sub-County", "Kyanaisoke Sub-County", "Ruteete Sub-County"],
  // Kakumiro
  "Kakumiro County": ["Kakumiro Sub-County", "Kakumiro Town Council", "Kasambya Sub-County", "Kibaale Sub-County", "Kitegwa Sub-County"],
  "Bugangaizi County": ["Igayaza Sub-County", "Kakindo Sub-County", "Kisiita Sub-County", "Kisiita Town Council", "Nkooko Sub-County"],
  // Kalangala
  "Bujumba County": ["Bujumba Sub-County", "Kalangala Sub-County", "Kalangala Town Council", "Mugoye Sub-County"],
  "Kyamuswa County": ["Bufumira Sub-County", "Bukasa Sub-County", "Mazinga Sub-County"],
  // Kaliro
  "Bulamogi County": ["Bukamba Sub-County", "Bumanya Sub-County", "Bumanya Town Council", "Gadumire Sub-County", "Kaliro Sub-County", "Kaliro Town Council", "Namugongo Sub-County"],
  "Bulamogi North County": ["Kisinda Sub-County", "Nawaikoke Sub-County", "Nawaikoke Town Council"],
  // Kalungu
  "Kalungu County East": ["Bukulula Sub-County", "Kalungu Sub-County", "Kalungu Town Council", "Lukaya Town Council"],
  "Kalungu County West": ["Kyamulibwa Sub-County", "Lwabenge Sub-County"],
  // Kampala
  "Central Division": ["Kisenyi Parish", "Civic Centre Parish", "Old Kampala Parish", "Kagugube Parish", "Kamwokya Parish", "Kololo Parish", "Nakasero Parish"],
  "Kawempe Division": ["Bwaise Parish", "Kawempe Parish", "Kanyanya Parish", "Komamboga Parish", "Kyebando Parish", "Makerere Parish", "Mpererwe Parish", "Mulago Parish", "Wandegeya Parish"],
  "Makindye Division": ["Bukasa Parish", "Buziga Parish", "Ggaba Parish", "Kabalagala Parish", "Katwe Parish", "Kibuli Parish", "Kibuye Parish", "Kisugu Parish", "Luwafu Parish", "Makindye Parish", "Nsambya Parish", "Salaama Parish"],
  "Nakawa Division": ["Banda Parish", "Bukoto Parish", "Butabika Parish", "Bugolobi Parish", "Kiswa Parish", "Kyambogo Parish", "Luzira Parish", "Mbuya Parish", "Mutungo Parish", "Naguru Parish", "Nakawa Parish", "Ntinda Parish"],
  "Rubaga Division": ["Kabowa Parish", "Kawaala Parish", "Lubaga Parish", "Lungujja Parish", "Mutundwe Parish", "Nakulabye Parish", "Nateete Parish", "Ndeeba Parish", "Rubaga Parish", "Wakaliga Parish"],
  // Kamuli
  "Bugabula County North": ["Balawoli Sub-County", "Bugulumbya Sub-County", "Kamuli Municipality", "Kitayunjwa Sub-County", "Nabwigulu Sub-County", "Nawanyago Sub-County"],
  "Bugabula County South": ["Bulopa Sub-County", "Buyende Sub-County", "Mbulamuti Sub-County", "Mbulamuti Town Council", "Wankole Sub-County"],
  "Buzaaya County": ["Butansi Sub-County", "Kisozi Sub-County", "Namasagali Sub-County", "Namwendwa Sub-County"],
  // Kamwenge
  "Kamwenge County": ["Biguli Sub-County", "Bihanga Sub-County", "Kahunge Sub-County", "Kamwenge Sub-County", "Kamwenge Town Council", "Nkoma Sub-County"],
  "Kibale County": ["Busiriba Sub-County", "Kabambiro Sub-County", "Kicheche Sub-County", "Mahyoro Sub-County", "Ntara Sub-County"],
  // Kanungu
  "Kinkizi County East": ["Kanungu Sub-County", "Kanungu Town Council", "Kayonza Sub-County", "Kirima Sub-County", "Mpungu Sub-County", "Rugyeyo Sub-County"],
  "Kinkizi County West": ["Butogota Town Council", "Kambuga Sub-County", "Kambuga Town Council", "Kihihi Sub-County", "Kihihi Town Council", "Nyamirama Sub-County"],
  // Kapchorwa
  "Tingey County": ["Kapchorwa Municipality", "Chema Sub-County", "Kawowo Sub-County", "Sipi Sub-County", "Tegeres Sub-County"],
  // Kapelebyong (merged with Amuria's Kapelebyong County above)
  // Karenga
  "Karenga County": ["Karenga Sub-County", "Karenga Town Council", "Kapedo Sub-County", "Sangar Sub-County"],
  // Kasanda
  "Kasanda County North": ["Kasanda Sub-County", "Kasanda Town Council", "Kitumbi Sub-County", "Myanzi Sub-County"],
  "Kasanda County South": ["Kalwana Sub-County", "Kiganda Sub-County", "Kiganda Town Council", "Sekanyonyi Sub-County"],
  // Kasese
  "Bukonzo County East": ["Bwera Sub-County", "Bwera Town Council", "Ihandiro Sub-County", "Isango Sub-County", "Karambi Sub-County", "Kitholhu Sub-County", "Maliba Sub-County"],
  "Bukonzo County West": ["Bugoye Sub-County", "Ibanda Sub-County", "Kasese Municipality", "Kilembe Sub-County", "Kisinga Sub-County", "Muhokya Sub-County"],
  "Busongora County North": ["Hima Town Council", "Katwe-Kabatoro Town Council", "Karusandara Sub-County", "Kilembe Sub-County", "Lake Katwe Sub-County", "Munkunyu Sub-County"],
  "Busongora County South": ["Kyabarungira Sub-County", "Kyondo Sub-County", "Mahango Sub-County", "Nyakiyumbu Sub-County"],
  // Katakwi
  "Katakwi County": ["Katakwi Sub-County", "Katakwi Town Council", "Magoro Sub-County", "Ngariam Sub-County", "Olilim Sub-County"],
  "Toroma County": ["Kapujan Sub-County", "Ongongoja Sub-County", "Toroma Sub-County", "Usuk Sub-County"],
  // Kayunga
  "Baale County": ["Bbaale Sub-County", "Bbaale Town Council", "Galiraaya Sub-County", "Kayonza Sub-County", "Kitimbwa Sub-County", "Nazigo Sub-County"],
  "Ntenjeru County North": ["Busaana Sub-County", "Kangulumira Sub-County", "Kangulumira Town Council", "Kayunga Sub-County", "Kayunga Town Council"],
  "Ntenjeru County South": ["Nabuganyi Sub-County", "Wabinyonyi Sub-County"],
  // Kazo
  "Kazo County": ["Buremba Sub-County", "Buremba Town Council", "Kazo Sub-County", "Kazo Town Council", "Magondo Sub-County", "Nkungu Sub-County"],
  // Kibaale
  "Bugangaizi County East": ["Kagadi Sub-County", "Kibaale Sub-County", "Kibaale Town Council", "Mugarama Sub-County"],
  "Bugangaizi County West": ["Bwamiramira Sub-County", "Kakumiro Sub-County", "Kisiita Sub-County"],
  "Buyanja County": ["Buyanja Sub-County", "Kakindo Sub-County", "Kiryanga Sub-County", "Matale Sub-County"],
  // Kiboga
  "Kiboga County East": ["Bukomero Sub-County", "Bukomero Town Council", "Dwaniro Sub-County", "Kiboga Sub-County", "Kiboga Town Council"],
  "Kiboga County West": ["Kapeke Sub-County", "Lwamata Sub-County", "Muwanga Sub-County", "Nsambya Sub-County"],
  // Kibuku
  "Kibuku County": ["Bulangira Sub-County", "Kadama Sub-County", "Kibuku Sub-County", "Kibuku Town Council", "Kirika Sub-County", "Tirinyi Sub-County", "Tirinyi Town Council"],
  // Kikuube
  "Kikuube County": ["Buhimba Sub-County", "Kabwoya Sub-County", "Kigorobya Sub-County", "Kikuube Sub-County", "Kikuube Town Council"],
  // Kiruhura
  "Nyabushozi County": ["Kakyera Sub-County", "Kanyaryeru Sub-County", "Kenshunga Sub-County", "Kikatsi Sub-County", "Kinoni Sub-County", "Kinoni Town Council", "Kiruhura Sub-County", "Kiruhura Town Council", "Sanga Sub-County", "Sanga Town Council"],
  // Kiryandongo
  "Kibanda County": ["Kiryandongo Sub-County", "Kiryandongo Town Council", "Kigumba Sub-County", "Kigumba Town Council", "Mutunda Sub-County"],
  "Kibanda North County": ["Masindi Port Sub-County", "Bweyale Town Council"],
  // Kisoro
  "Bufumbira County East": ["Bukimbiri Sub-County", "Chahi Sub-County", "Kisoro Municipality", "Muramba Sub-County", "Nyabwishenya Sub-County", "Nyakabande Sub-County"],
  "Bufumbira County South": ["Kanaba Sub-County", "Kirundo Sub-County", "Murora Sub-County", "Nyarusiza Sub-County", "Nyundo Sub-County"],
  // Kitagwenda
  "Kitagwenda County": ["Kitagwenda Sub-County", "Kitagwenda Town Council", "Kicece Sub-County", "Mahyoro Sub-County", "Ntara Sub-County"],
  // Kitgum
  "Chua County East": ["Kitgum Municipality", "Kitgum Matidi Sub-County", "Labongo-Akwang Sub-County", "Labongo-Amida Sub-County", "Mucwini Sub-County"],
  "Chua County West": ["Labongo-Layamo Sub-County", "Lagoro Sub-County", "Namokora Sub-County", "Orom Sub-County"],
  // Koboko
  "Koboko County": ["Koboko Municipality", "Koboko Sub-County", "Lobule Sub-County"],
  "Aringa County": ["Kululu Sub-County", "Ludara Sub-County", "Midia Sub-County"],
  // Kole
  "Kole County": ["Aboke Sub-County", "Alito Sub-County", "Bala Sub-County", "Kole Sub-County", "Kole Town Council"],
  "Kole North County": ["Ayer Sub-County", "Okwerodot Sub-County"],
  // Kotido
  "Jie County": ["Kotido Sub-County", "Kotido Town Council", "Nakapelimoru Sub-County", "Panyangara Sub-County", "Rengen Sub-County"],
  // Kumi
  "Kumi County": ["Kumi Municipality", "Kumi Sub-County", "Mukongoro Sub-County", "Nyero Sub-County", "Ongino Sub-County"],
  // Kwania
  "Kwania County": ["Aduku Sub-County", "Kwania Sub-County", "Maruzi Sub-County", "Nambieso Sub-County"],
  "Kwania North County": ["Atongtidi Sub-County", "Inomo Sub-County"],
  // Kween
  "Kween County": ["Benet Sub-County", "Binyiny Sub-County", "Kaproron Sub-County", "Kween Sub-County", "Kween Town Council", "Kwosir Sub-County"],
  // Kyankwanzi
  "Kyankwanzi County": ["Butemba Sub-County", "Gayaza Sub-County", "Kyankwanzi Sub-County", "Kyankwanzi Town Council", "Mulagi Sub-County", "Ntwetwe Sub-County"],
  "Ntwetwe County": ["Ntwetwe Town Council", "Wattuba Sub-County"],
  // Kyegegwa
  "Kyaka County": ["Hapuuyo Sub-County", "Kakabara Sub-County", "Kyegegwa Sub-County", "Kyegegwa Town Council", "Mpara Sub-County"],
  "Kyegegwa County": ["Kasule Sub-County", "Kisiita Sub-County", "Migadde Sub-County"],
  // Kyenjojo
  "Kyenjojo County": ["Katooke Sub-County", "Kyenjojo Sub-County", "Kyenjojo Town Council", "Kyarusozi Sub-County"],
  "Mwenge County North": ["Butunduzi Sub-County", "Katoke Sub-County", "Kisojo Sub-County", "Nyankwanzi Sub-County"],
  "Mwenge County South": ["Bufunjo Sub-County", "Bugaaki Sub-County", "Kanyatsi Sub-County", "Nyantungo Sub-County"],
  // Kyotera
  "Kyotera County": ["Kabira Sub-County", "Kasaali Sub-County", "Kyotera Sub-County", "Kyotera Town Council", "Nabigasa Sub-County"],
  "Kakuuto County": ["Kakuuto Sub-County", "Kalisizo Sub-County", "Kalisizo Town Council", "Lwankoni Sub-County"],
  // Lamwo
  "Lamwo County": ["Agoro Sub-County", "Lamwo Sub-County", "Lamwo Town Council", "Lokung Sub-County", "Madi-Opei Sub-County", "Padibe Sub-County", "Padibe Town Council", "Palabek-Gem Sub-County", "Palabek-Kal Sub-County", "Palabek-Ogili Sub-County"],
  // Lira
  "Erute County North": ["Agali Sub-County", "Agweng Sub-County", "Aromo Sub-County", "Lira Municipality", "Ogur Sub-County"],
  "Erute County South": ["Amach Sub-County", "Barr Sub-County", "Lira Sub-County", "Ngetta Sub-County", "Ojwina Division"],
  // Luuka
  "Luuka County North": ["Bukanga Sub-County", "Bulongo Sub-County", "Irongo Sub-County", "Luuka Sub-County", "Luuka Town Council"],
  "Luuka County South": ["Bukoma Sub-County", "Ikumbya Sub-County", "Nawampiti Sub-County", "Waibuga Sub-County"],
  // Luwero
  "Bamunanika County": ["Bamunanika Sub-County", "Bombo Town Council", "Kamira Sub-County", "Luwero Sub-County", "Luwero Town Council", "Zirobwe Sub-County"],
  "Katikamu County North": ["Butuntumula Sub-County", "Katikamu Sub-County", "Kikyusa Sub-County", "Makulubita Sub-County", "Nyimbwa Sub-County"],
  "Katikamu County South": ["Kalagala Sub-County", "Kasana Sub-County", "Wobulenzi Town Council"],
  // Lwengo
  "Lwengo County": ["Kisekka Sub-County", "Lwengo Sub-County", "Lwengo Town Council", "Ndagwe Sub-County"],
  "Lwengo South County": ["Kyazanga Sub-County", "Kyazanga Town Council", "Malongo Sub-County"],
  // Lyantonde
  "Lyantonde County": ["Kinuuka Sub-County", "Lyantonde Sub-County", "Lyantonde Town Council"],
  "Kabula County": ["Kasagama Sub-County", "Kaliiro Sub-County", "Mpumudde Sub-County"],
  // Madi-Okollo
  "Madi-Okollo County": ["Madi-Okollo Sub-County", "Madi-Okollo Town Council", "Ogoko Sub-County", "Oluvu Sub-County"],
  "Okollo County": ["Okollo Sub-County", "Paidha Sub-County", "Paidha Town Council", "Pawor Sub-County"],
  // Manafwa
  "Bubulo County East": ["Bubulo Sub-County", "Bukhabusi Sub-County", "Bumbo Sub-County", "Bupoto Sub-County", "Manafwa Sub-County", "Manafwa Town Council"],
  "Bubulo County West": ["Bubutu Sub-County", "Bukusu Sub-County", "Butiru Sub-County", "Sibanga Sub-County"],
  // Maracha
  "Maracha County": ["Maracha Sub-County", "Maracha Town Council", "Nyadri Sub-County", "Oluffe Sub-County", "Yivu Sub-County"],
  "Maracha East County": ["Kijomoro Sub-County", "Oluvu Sub-County", "Tara Sub-County"],
  // Masaka
  "Bukoto County East": ["Buwunga Sub-County", "Kabonera Sub-County", "Kimanya-Kabonera Division", "Masaka Municipality", "Nyendo-Senyange Division"],
  "Bukoto County West": ["Bukakata Sub-County", "Kyannamukaaka Sub-County", "Mukungwe Sub-County"],
  // Masindi
  "Bujenje County": ["Budongo Sub-County", "Bwijanga Sub-County", "Karujubu Division", "Masindi Municipality", "Miirya Sub-County", "Pakanyi Sub-County"],
  "Buruli County": ["Kimengo Sub-County", "Kinyara Sub-County", "Masindi Port Sub-County"],
  // Mayuge
  "Bunya County East": ["Baitambogwe Sub-County", "Busakira Sub-County", "Imanyiro Sub-County", "Mayuge Sub-County", "Mayuge Town Council"],
  "Bunya County South": ["Bukabooli Sub-County", "Buwaiswa Sub-County", "Jaguzi Sub-County", "Kityerera Sub-County", "Malongo Sub-County"],
  "Bunya County West": ["Kigandalo Sub-County", "Mpungwe Sub-County", "Nankoma Sub-County", "Wairasa Sub-County"],
  // Mbale
  "Bungokho County North": ["Bufumbo Sub-County", "Busiu Sub-County", "Mbale City North Division", "Nabumali Sub-County", "Namanyonyi Sub-County"],
  "Bungokho County South": ["Busoba Sub-County", "Bungokho Sub-County", "Mbale City South Division", "Nakaloke Sub-County", "Wanale Sub-County"],
  // Mbarara
  "Kashari County North": ["Biharwe Division", "Kakiika Division", "Kamukuzi Division", "Mbarara City North Division", "Nyamitanga Division", "Rubindi Sub-County"],
  "Kashari County South": ["Bukiro Sub-County", "Kagongi Sub-County", "Kashare Sub-County", "Mbarara City South Division", "Ndeija Sub-County", "Rubaya Sub-County", "Rwanyamahembe Sub-County"],
  // Mitooma
  "Ruhinda County North": ["Kanyabwanga Sub-County", "Kashenshero Sub-County", "Mitooma Sub-County", "Mitooma Town Council"],
  "Ruhinda County South": ["Bitereko Sub-County", "Kiyanga Sub-County", "Mutara Sub-County", "Rwashamaire Sub-County"],
  // Mityana
  "Mityana County North": ["Busimbi Sub-County", "Malangala Sub-County", "Mityana Municipality", "Namutamba Sub-County", "Ssekanyonyi Sub-County"],
  "Mityana County South": ["Bulera Sub-County", "Kalangaalo Sub-County", "Maanyi Sub-County", "Zigoti Sub-County"],
  // Moroto
  "Matheniko County": ["Katikekile Sub-County", "Moroto Municipality", "Nadunget Sub-County", "Rupa Sub-County", "Tapac Sub-County"],
  // Moyo
  "Moyo County": ["Moyo Sub-County", "Moyo Town Council", "Metu Sub-County"],
  "West Moyo County": ["Dufile Sub-County", "Lefori Sub-County", "Itula Sub-County"],
  // Mpigi
  "Mawokota County North": ["Buwama Sub-County", "Buwama Town Council", "Kammengo Sub-County", "Mpigi Sub-County", "Mpigi Town Council", "Muduuma Sub-County"],
  "Mawokota County South": ["Bukuya Sub-County", "Kituntu Sub-County", "Nkozi Sub-County"],
  // Mubende
  "Buwekula County": ["Bagezza Sub-County", "Kasambya Sub-County", "Kitenga Sub-County", "Mubende Municipality", "Nabingoola Sub-County"],
  "Kasambya County": ["Bukuya Sub-County", "Kalwana Sub-County", "Kasambya Sub-County", "Kiganda Sub-County"],
  // Mukono
  "Mukono County North": ["Goma Sub-County", "Kyampisi Sub-County", "Mukono Municipality", "Nama Sub-County", "Nakisunga Sub-County"],
  "Mukono County South": ["Kojja Sub-County", "Koome Sub-County", "Mpatta Sub-County", "Ntenjeru Sub-County"],
  "Nakifuma County": ["Kimenyedde Sub-County", "Nagojje Sub-County", "Nakifuma Sub-County", "Nabaale Sub-County", "Ntunda Sub-County", "Seeta-Namuganga Sub-County"],
  // Nabilatuk
  "Nabilatuk County": ["Kakomongole Sub-County", "Lolachat Sub-County", "Lorengedwat Sub-County", "Nabilatuk Sub-County", "Nabilatuk Town Council"],
  // Nakapiripirit
  "Chekwii County": ["Kakomongole Sub-County", "Loregae Sub-County", "Moruita Sub-County", "Nakapiripirit Sub-County", "Nakapiripirit Town Council", "Namalu Sub-County"],
  "Kadam County": ["Chekwii Sub-County", "Kadam Sub-County", "Tokora Sub-County"],
  // Nakaseke
  "Nakaseke County North": ["Kinyogoga Sub-County", "Nakaseke Sub-County", "Nakaseke Town Council", "Ngoma Sub-County", "Semuto Sub-County", "Semuto Town Council"],
  "Nakaseke County South": ["Kasangombe Sub-County", "Kinoni Sub-County", "Wakyato Sub-County"],
  // Nakasongola
  "Budyebo County": ["Kakooge Sub-County", "Kalongo Sub-County", "Kalungi Sub-County", "Lwampanga Sub-County", "Wabinyonyi Sub-County"],
  "Nakasongola County": ["Lwabyata Sub-County", "Nakasongola Sub-County", "Nakasongola Town Council", "Nakitoma Sub-County", "Nabiswera Sub-County"],
  // Namayingo
  "Namayingo County North": ["Banda Sub-County", "Buyinja Sub-County", "Lolwe Sub-County", "Namayingo Sub-County", "Namayingo Town Council"],
  "Namayingo County South": ["Buswale Sub-County", "Mutumba Sub-County", "Sigulu Sub-County"],
  // Namisindwa
  "Namisindwa County": ["Bukiabi Sub-County", "Bumbo Sub-County", "Lwakhakha Sub-County", "Lwakhakha Town Council", "Namisindwa Sub-County"],
  "Bubulo East County": ["Magale Sub-County", "Namabya Sub-County", "Namboko Sub-County"],
  // Namutumba
  "Busiki County North": ["Ivukula Sub-County", "Kibaale Sub-County", "Magada Sub-County", "Namutumba Sub-County", "Namutumba Town Council"],
  "Busiki County South": ["Bulange Sub-County", "Bukonte Sub-County", "Nsinze Sub-County"],
  // Napak
  "Bokora County": ["Iriiri Sub-County", "Lokopo Sub-County", "Lopeei Sub-County", "Lorengecora Sub-County", "Lotome Sub-County", "Napak Sub-County", "Napak Town Council", "Ngoleriet Sub-County"],
  // Nebbi
  "Jonam County": ["Akworo Sub-County", "Nebbi Municipality", "Nyaravur Sub-County", "Pakwach Sub-County", "Wadelai Sub-County"],
  "Padyere County": ["Erussi Sub-County", "Kucwiny Sub-County", "Nebbi Sub-County", "Parombo Sub-County"],
  // Ngora
  "Ngora County": ["Kapir Sub-County", "Kobwin Sub-County", "Mukura Sub-County", "Ngora Sub-County", "Ngora Town Council"],
  // Ntoroko
  "Ntoroko County": ["Butungama Sub-County", "Kanara Sub-County", "Karugutu Sub-County", "Karugutu Town Council", "Ntoroko Sub-County", "Ntoroko Town Council", "Rwebisengo Sub-County", "Rwebisengo Town Council"],
  // Ntungamo
  "Kajara County": ["Itojo Sub-County", "Kajara Sub-County", "Ngoma Sub-County", "Ntungamo Municipality", "Rubaare Sub-County", "Rubaare Town Council"],
  "Ruhaama County": ["Ihunga Sub-County", "Ntungamo Sub-County", "Nyakyera Sub-County", "Ruhaama Sub-County", "Rweikiniro Sub-County"],
  "Rushenyi County": ["Bwongyera Sub-County", "Kayonza Sub-County", "Kitwe Sub-County", "Nyabisirira Sub-County", "Rugarama Sub-County"],
  // Nwoya
  "Nwoya County": ["Alero Sub-County", "Anaka Sub-County", "Anaka Town Council", "Koch-Goma Sub-County", "Nwoya Sub-County", "Purongo Sub-County"],
  // Obongi
  "Obongi County": ["Itula Sub-County", "Obongi Sub-County", "Obongi Town Council", "Panyimur Sub-County"],
  // Omoro (merged with Gulu's Omoro County above)
  // Otuke
  "Otuke County": ["Adwari Sub-County", "Orum Sub-County", "Otuke Sub-County", "Otuke Town Council", "Okwang Sub-County", "Olilim Sub-County"],
  // Oyam
  "Oyam County North": ["Aber Sub-County", "Acaba Sub-County", "Aleka Sub-County", "Iceme Sub-County", "Ngai Sub-County", "Oyam Sub-County", "Oyam Town Council"],
  "Oyam County South": ["Abok Sub-County", "Kamdini Sub-County", "Minakulu Sub-County", "Myene Sub-County"],
  // Pader
  "Aruu County North": ["Acholi-Bur Sub-County", "Atanga Sub-County", "Awere Sub-County", "Pader Sub-County", "Pader Town Council", "Pajule Sub-County"],
  "Aruu County South": ["Angagura Sub-County", "Kilak Sub-County", "Lacekocot Sub-County", "Lapul Sub-County", "Ogom Sub-County", "Puranga Sub-County"],
  // Pakwach
  "Pakwach County": ["Pakwach Sub-County", "Pakwach Town Council", "Panyango Sub-County", "Panyimur Sub-County"],
  // Pallisa
  "Pallisa County": ["Agule Sub-County", "Gogonyo Sub-County", "Kameke Sub-County", "Pallisa Sub-County", "Pallisa Town Council"],
  // Note: Kibale County and Butebo County already defined above under Kamwenge and Butebo districts
  // Rakai
  "Kooki County": ["Byakabanda Sub-County", "Dwaniro Sub-County", "Kagamba Sub-County", "Lwamaggwa Sub-County", "Rakai Sub-County", "Rakai Town Council"],
  // Note: Kyotera County already defined above under Kyotera district
  // Rubanda
  "Rubanda County East": ["Bubaare Sub-County", "Bufundi Sub-County", "Hamurwa Sub-County", "Muko Sub-County", "Rubanda Sub-County", "Rubanda Town Council"],
  "Rubanda County West": ["Bubare Sub-County", "Ikumba Sub-County", "Nyamweru Sub-County"],
  // Rubirizi
  "Bunyaruguru County": ["Bunyaruguru Sub-County", "Katunguru Sub-County", "Kichwamba Sub-County", "Magambo Sub-County", "Ryeru Sub-County", "Rubirizi Sub-County", "Rubirizi Town Council"],
  // Rukiga
  "Rukiga County": ["Bukinda Sub-County", "Kamwezi Sub-County", "Kashambya Sub-County", "Mparo Sub-County", "Rukiga Sub-County", "Rukiga Town Council"],
  // Rukungiri
  "Rubabo County": ["Bwambara Sub-County", "Buyanja Sub-County", "Kebisoni Sub-County", "Nyakagyeme Sub-County", "Nyarushanje Sub-County"],
  "Rujumbura County": ["Bugangari Sub-County", "Buhunga Sub-County", "Bwambara Sub-County", "Nyakishenyi Sub-County", "Rukungiri Municipality"],
  // Rwampara
  "Rwampara County East": ["Bugamba Sub-County", "Mwizi Sub-County", "Ndaija Sub-County", "Rwampara Sub-County"],
  "Rwampara County West": ["Itojo Sub-County", "Kyampangara Sub-County", "Ndeija Sub-County"],
  // Sembabule
  "Lwemiyaga County": ["Lugusulu Sub-County", "Lwemiyaga Sub-County", "Lwebitakuli Sub-County", "Ntuusi Sub-County"],
  "Mawogola County North": ["Mateete Sub-County", "Mijwala Sub-County", "Sembabule Sub-County", "Sembabule Town Council"],
  "Mawogola County South": ["Lugusulu Sub-County", "Ntusi Sub-County"],
  // Serere
  "Serere County": ["Bugondo Sub-County", "Kadungulu Sub-County", "Kyere Sub-County", "Olio Sub-County", "Pingire Sub-County", "Serere Sub-County", "Serere Town Council"],
  "Kasilo County": ["Atiira Sub-County", "Kateta Sub-County", "Labori Sub-County"],
  // Sheema
  "Sheema County North": ["Kabwohe-Itendero Town Council", "Kyangyenyi Sub-County", "Masheruka Sub-County", "Shuuku Sub-County"],
  "Sheema County South": ["Kagango Sub-County", "Kigarama Sub-County", "Kitagata Sub-County", "Kitagata Town Council", "Sheema Sub-County"],
  // Sironko
  "Budadiri County East": ["Budadiri Sub-County", "Budadiri Town Council", "Bukhalu Sub-County", "Buluganya Sub-County", "Bumasifwa Sub-County", "Buwalasi Sub-County"],
  "Budadiri County West": ["Buhugu Sub-County", "Bukiise Sub-County", "Bukyambi Sub-County", "Masaba Sub-County", "Sironko Sub-County", "Sironko Town Council", "Zesui Sub-County"],
  // Soroti
  "Soroti County": ["Arapai Sub-County", "Gweri Sub-County", "Kamuda Sub-County", "Katine Sub-County", "Soroti Municipality", "Tubur Sub-County"],
  // Tororo
  "Tororo County North": ["Iyolwa Sub-County", "Kisoko Sub-County", "Kwapa Sub-County", "Mella Sub-County", "Paya Sub-County"],
  "Tororo County South": ["Mulanda Sub-County", "Nagongera Sub-County", "Nagongera Town Council", "Rubongi Sub-County"],
  "West Budama County North": ["Kirewa Sub-County", "Molo Sub-County", "Mukujju Sub-County", "Tororo Municipality"],
  "West Budama County South": ["Butaleja Sub-County", "Himutu Sub-County", "Mazimasa Sub-County", "Nawanjofu Sub-County"],
  // Wakiso
  "Busiro County East": ["Kakiri Sub-County", "Kakiri Town Council", "Kasanje Sub-County", "Katabi Sub-County", "Mpala Sub-County", "Ssisa Sub-County", "Wakiso Sub-County", "Wakiso Town Council"],
  "Busiro County South": ["Bussi Sub-County", "Kajjansi Sub-County", "Kasanje Sub-County"],
  "Kyadondo County East": ["Goma Sub-County", "Kira Municipality", "Namugongo Sub-County", "Nsangi Sub-County"],
  "Kyadondo County South": ["Entebbe Municipality", "Katabi Sub-County", "Makindye-Ssabagabo Municipality"],
  "Nansana Municipality": ["Nabweru Division", "Nansana Division", "Wamala Division"],
  // Yumbe
  "Aringa County North": ["Kei Sub-County", "Kululu Sub-County", "Midigo Sub-County", "Romogi Sub-County", "Yumbe Sub-County", "Yumbe Town Council"],
  "Aringa County South": ["Ariwa Sub-County", "Drajini Sub-County", "Kerwa Sub-County", "Kuru Sub-County", "Lodonga Sub-County"],
  // Zombo
  "Okoro County": ["Atyak Sub-County", "Nyapea Sub-County", "Nyapea Town Council", "Paidha Sub-County"],
  "Zombo County": ["Abanga Sub-County", "Jangokoro Sub-County", "Warr Sub-County", "Zombo Sub-County", "Zombo Town Council"],
};

// Sub-County → Parishes (representative parishes for each sub-county)
const subCountyParishes: Record<string, string[]> = {
  // Kampala - Central Division
  "Kisenyi Parish": ["Kisenyi I", "Kisenyi II", "Kisenyi III"],
  "Civic Centre Parish": ["Civic Centre"],
  "Old Kampala Parish": ["Old Kampala I", "Old Kampala II", "Old Kampala III"],
  "Kagugube Parish": ["Kagugube I", "Kagugube II"],
  "Kamwokya Parish": ["Kamwokya I", "Kamwokya II"],
  "Kololo Parish": ["Kololo I", "Kololo II", "Kololo III"],
  "Nakasero Parish": ["Nakasero I", "Nakasero II", "Nakasero III"],
  // Kampala - Kawempe Division
  "Bwaise Parish": ["Bwaise I", "Bwaise II", "Bwaise III"],
  "Kawempe Parish": ["Kawempe I", "Kawempe II"],
  "Kanyanya Parish": ["Kanyanya I", "Kanyanya II"],
  "Komamboga Parish": ["Komamboga"],
  "Kyebando Parish": ["Kyebando I", "Kyebando II"],
  "Makerere Parish": ["Makerere I", "Makerere II", "Makerere III"],
  "Mpererwe Parish": ["Mpererwe I", "Mpererwe II"],
  "Mulago Parish": ["Mulago I", "Mulago II", "Mulago III"],
  "Wandegeya Parish": ["Wandegeya"],
  // Kampala - Makindye Division
  "Bukasa Parish": ["Bukasa I", "Bukasa II"],
  "Buziga Parish": ["Buziga"],
  "Ggaba Parish": ["Ggaba I", "Ggaba II"],
  "Kabalagala Parish": ["Kabalagala I", "Kabalagala II"],
  "Katwe Parish": ["Katwe I", "Katwe II"],
  "Kibuli Parish": ["Kibuli I", "Kibuli II"],
  "Kibuye Parish": ["Kibuye I", "Kibuye II"],
  "Kisugu Parish": ["Kisugu I", "Kisugu II"],
  "Luwafu Parish": ["Luwafu I", "Luwafu II"],
  "Makindye Parish": ["Makindye I", "Makindye II"],
  "Nsambya Parish": ["Nsambya Central", "Nsambya Estate", "Nsambya Police"],
  "Salaama Parish": ["Salaama"],
  // Kampala - Nakawa Division
  "Banda Parish": ["Banda I", "Banda II"],
  "Bukoto Parish": ["Bukoto I", "Bukoto II"],
  "Butabika Parish": ["Butabika"],
  "Bugolobi Parish": ["Bugolobi"],
  "Kiswa Parish": ["Kiswa"],
  "Kyambogo Parish": ["Kyambogo"],
  "Luzira Parish": ["Luzira I", "Luzira II"],
  "Mbuya Parish": ["Mbuya I", "Mbuya II"],
  "Mutungo Parish": ["Mutungo"],
  "Naguru Parish": ["Naguru I", "Naguru II"],
  "Nakawa Parish": ["Nakawa I", "Nakawa II"],
  "Ntinda Parish": ["Ntinda I", "Ntinda II"],
  // Kampala - Rubaga Division
  "Kabowa Parish": ["Kabowa I", "Kabowa II"],
  "Kawaala Parish": ["Kawaala I", "Kawaala II"],
  "Lubaga Parish": ["Lubaga I", "Lubaga II"],
  "Lungujja Parish": ["Lungujja"],
  "Mutundwe Parish": ["Mutundwe I", "Mutundwe II"],
  "Nakulabye Parish": ["Nakulabye"],
  "Nateete Parish": ["Nateete"],
  "Ndeeba Parish": ["Ndeeba"],
  "Rubaga Parish": ["Rubaga"],
  "Wakaliga Parish": ["Wakaliga"],
  // Luwero - Bamunanika County
  "Bamunanika Sub-County": ["Bamunanika", "Kibuye", "Kigangazzi", "Kiwoko"],
  "Bombo Town Council": ["Bombo Central", "Bombo East", "Bombo West"],
  "Kamira Sub-County": ["Kamira", "Kikoola", "Kyetume", "Namulanda"],
  "Luwero Sub-County": ["Kasana", "Kikoola", "Luwero Central", "Makulubita"],
  "Luwero Town Council": ["Luwero Central Ward", "Luwero East Ward", "Luwero West Ward"],
  "Zirobwe Sub-County": ["Kibuye", "Namulanda", "Zirobwe Central", "Zirobwe East"],
  // Luwero - Katikamu County North
  "Butuntumula Sub-County": ["Butuntumula", "Kalagala", "Kiwenda", "Namunyumya"],
  "Katikamu Sub-County": ["Katikamu", "Kiwoko", "Namunyumya", "Wobulenzi"],
  "Kikyusa Sub-County": ["Kikyusa", "Mpererwe", "Namulanda", "Wobulenzi"],
  "Makulubita Sub-County": ["Makulubita", "Namulanda", "Wabitungulu"],
  "Nyimbwa Sub-County": ["Busiika", "Nyimbwa", "Wabitungulu"],
  // Luwero - Katikamu County South
  "Kalagala Sub-County": ["Kalagala", "Kasana", "Kibuye"],
  "Kasana Sub-County": ["Kasana Central", "Kasana East", "Kasana West"],
  "Wobulenzi Town Council": ["Wobulenzi Central", "Wobulenzi East", "Wobulenzi North", "Wobulenzi South"],
  // Wakiso - Busiro County East
  "Kakiri Sub-County": ["Kakiri", "Buloba", "Namulanda", "Nansana"],
  "Kakiri Town Council": ["Kakiri Central", "Kakiri East"],
  "Kasanje Sub-County": ["Kasanje", "Kigungu", "Namulanda"],
  "Katabi Sub-County": ["Katabi", "Kitala", "Namulanda"],
  "Mpala Sub-County": ["Mpala", "Namulanda", "Ssenge"],
  "Ssisa Sub-County": ["Ssisa", "Namulanda", "Ttamu"],
  "Wakiso Sub-County": ["Wakiso Central", "Maganjo", "Namulanda", "Ssabagabo"],
  "Wakiso Town Council": ["Wakiso Central Ward", "Wakiso East Ward", "Wakiso West Ward"],
  // Wakiso - Busiro County South
  "Bussi Sub-County": ["Bussi", "Namulanda"],
  "Kajjansi Sub-County": ["Kajjansi", "Kitende", "Namulanda", "Sseguku"],
  // Wakiso - Kyadondo County East
  "Goma Sub-County": ["Goma", "Kasangati", "Kiteezi", "Magere"],
  "Kira Municipality": ["Kira Division", "Namugongo Division"],
  "Namugongo Sub-County": ["Namugongo", "Kiwango", "Sonde"],
  "Nsangi Sub-County": ["Nsangi", "Maya", "Namulanda", "Nabbingo"],
  // Wakiso - Kyadondo County South
  "Entebbe Municipality": ["Division A", "Division B"],
  "Makindye-Ssabagabo Municipality": ["Kisugu Division", "Ndejje Division", "Ssabagabo Division"],
  // Wakiso - Nansana Municipality
  "Nabweru Division": ["Nabweru", "Komamboga", "Ttula"],
  "Nansana Division": ["Nansana", "Kawaala", "Wamala"],
  "Wamala Division": ["Wamala", "Lugala"],
  // Mukono (Goma Sub-County already defined above under Wakiso)
  "Kyampisi Sub-County": ["Kyampisi", "Kasawo", "Nagalama"],
  "Mukono Municipality": ["Goma Division", "Mukono Central Division"],
  "Nama Sub-County": ["Nama", "Ntenjeru", "Seeta"],
  "Nakisunga Sub-County": ["Nakisunga", "Namanve", "Seeta-Namuganga"],
  "Kojja Sub-County": ["Kojja", "Katosi", "Mpatta"],
  "Koome Sub-County": ["Koome", "Lwabafu"],
  "Mpatta Sub-County": ["Mpatta", "Katosi"],
  "Ntenjeru Sub-County": ["Ntenjeru", "Mukono"],
  "Kimenyedde Sub-County": ["Kimenyedde", "Nagojje"],
  "Nagojje Sub-County": ["Nagojje", "Nabaale"],
  "Nakifuma Sub-County": ["Nakifuma", "Ntunda"],
  "Nabaale Sub-County": ["Nabaale", "Ntunda"],
  "Ntunda Sub-County": ["Ntunda", "Seeta"],
  "Seeta-Namuganga Sub-County": ["Seeta", "Namuganga"],
  // Mbarara
  "Biharwe Division": ["Biharwe", "Kakoba", "Ruti"],
  "Kakiika Division": ["Kakiika", "Nkokonjeru", "Ruti"],
  "Kamukuzi Division": ["Kamukuzi", "Ruharo"],
  "Mbarara City North Division": ["Biharwe", "Kakiika", "Kamukuzi"],
  "Nyamitanga Division": ["Nyamitanga", "Katete"],
  "Rubindi Sub-County": ["Rubindi", "Kashare", "Ndeija"],
  "Bukiro Sub-County": ["Bukiro", "Kashare"],
  "Kagongi Sub-County": ["Kagongi", "Rubindi"],
  "Kashare Sub-County": ["Kashare", "Rubindi"],
  "Mbarara City South Division": ["Nyamitanga", "Kamukuzi"],
  "Ndeija Sub-County": ["Ndeija", "Rubindi"],
  "Rubaya Sub-County": ["Rubaya", "Kashare"],
  "Rwanyamahembe Sub-County": ["Rwanyamahembe", "Kashare"],
  // Jinja
  "Bugembe Town Council": ["Bugembe Central", "Bugembe East", "Bugembe West"],
  "Buwenge Sub-County": ["Buwenge", "Butagaya", "Nawangoma"],
  "Buwenge Town Council": ["Buwenge Central", "Buwenge East"],
  "Kakira Sub-County": ["Kakira", "Wanyange", "Bugembe"],
  "Mafubira Sub-County": ["Mafubira", "Budondo", "Buwenge"],
  "Budondo Sub-County": ["Budondo", "Buwenge"],
  "Buyengo Sub-County": ["Buyengo", "Buwenge"],
  "Jinja Central Division": ["Jinja Central", "Main Street"],
  "Jinja North Division": ["Mpumudde", "Walukuba"],
  "Jinja South Division": ["Masese", "Kimaka"],
  // Mbale
  "Bufumbo Sub-County": ["Bufumbo", "Busiu", "Nabumali"],
  "Busiu Sub-County": ["Busiu", "Nabumali"],
  "Mbale City North Division": ["Malukhu", "Nabuyonga", "Wanale"],
  "Nabumali Sub-County": ["Nabumali", "Busiu"],
  "Namanyonyi Sub-County": ["Namanyonyi", "Busiu"],
  "Busoba Sub-County": ["Busoba", "Nakaloke"],
  "Bungokho Sub-County": ["Bungokho", "Nakaloke"],
  "Mbale City South Division": ["Industrial Division", "Northern Division"],
  "Nakaloke Sub-County": ["Nakaloke", "Busoba"],
  "Wanale Sub-County": ["Wanale", "Nabuyonga"],
  // Gulu
  "Awach Sub-County": ["Awach", "Bungatira"],
  "Bungatira Sub-County": ["Bungatira", "Awach"],
  "Lakwana Sub-County": ["Lakwana", "Patiko"],
  "Laroo-Pece Division": ["Laroo", "Pece"],
  "Layibi-Bardege Division": ["Layibi", "Bardege"],
  "Patiko Sub-County": ["Patiko", "Lakwana"],
  "Unyama Sub-County": ["Unyama", "Bungatira"],
  "Bobi Sub-County": ["Bobi", "Koro"],
  "Koro Sub-County": ["Koro", "Lalogi"],
  "Lalogi Sub-County": ["Lalogi", "Odek"],
  "Odek Sub-County": ["Odek", "Lalogi"],
};

// ============ EXPORTED HELPER FUNCTIONS ============

export const getDistrictNames = (): string[] => {
  return Object.keys(districtCounties).sort();
};

export const getCountiesForDistrict = (district: string): string[] => {
  return (districtCounties[district] || []).sort();
};

export const getSubCountiesForCounty = (county: string): string[] => {
  return (countySubCounties[county] || []).sort();
};

export const getParishesForSubCounty = (subCounty: string): string[] => {
  return (subCountyParishes[subCounty] || []).sort();
};
