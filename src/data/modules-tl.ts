export interface LessonTranslation {
  title: string;
  objective: string;
  instructions: string[];
  keyCallouts: string[];
  visualCaptions?: string[];
}

export interface ModuleTranslation {
  title: string;
  shortDesc: string;
}

export const MODULE_TRANSLATIONS_TL: Record<string, ModuleTranslation> = {
  "mod-1": {
    title: "Mga Batayan ng POS at Ayos ng Screen",
    shortDesc: "Unawain ang 12 pangunahing bahagi ng screen, status ng login ng cashier, at mga detalye ng transaksyon.",
  },
  "mod-2": {
    title: "Pagsisimula ng Araw, Pag-login, at Pag-logout",
    shortDesc: "Unang gawain ng cashier: pag-check ng petsa at oras, pagbukas ng terminal, at ligtas na pag-logout.",
  },
  "mod-3": {
    title: "Paghahanap ng Item at Customer Loyalty (LNQR)",
    shortDesc: "Pag-check ng SRP at promo price, paghahanap gamit ang barcode o description, at pag-record ng Laking National card.",
  },
  "mod-4": {
    title: "Mga Key sa Main Page at Batayang Transaksyon",
    shortDesc: "Paglalagay ng quantity, pagdagdag ng item, item void, transaction void, at non-merchandise coupon variance.",
  },
  "mod-5": {
    title: "Mga Function sa 2nd Page at Mga Diskwento",
    shortDesc: "Transaction discount (Senior, PWD, Employee), pag-reprint ng resibo, suspend & recall, at No Sale.",
  },
  "mod-6": {
    title: "Mga Function sa 3rd Page at Store Readings",
    shortDesc: "Cashier (Y) Reading sa pagtatapos ng shift, Terminal (Z) Reading sa pagsasara ng tindahan, at Sales Data Verification (SDV).",
  },
  "mod-7": {
    title: "Mga Function sa 4th Page at Espesyal na Transaksyon",
    shortDesc: "Transaction comment ng customer (TIN/Invoice details), zero-rated sales, return, at refund.",
  },
  "mod-8": {
    title: "Payment Screen at Mga Paraan ng Pagbabayad",
    shortDesc: "Pagproseso ng Cash at sukli, Bank Card, GCash, NBS Gift Card, Coupon, at Sulit Coins.",
  },
  "mod-9": {
    title: "Pagsusuri ng Kaalaman at Practical Certification",
    shortDesc: "Panghuling pagbabalik-aral at paghahanda para sa hands-on POS simulator assessment.",
  },
};

export const LESSON_TRANSLATIONS_TL: Record<string, LessonTranslation> = {
  "les-1-1": {
    title: "Panimula sa Point of Sale at Ayos ng Terminal",
    objective: "Kilalanin ang 12 pangunahing bahagi ng NBS POS screen kabilang ang barcode entry, line items, at function keys.",
    instructions: [
      "Unawain na pinagsasama ng POS ang hardware (terminal, barcode scanner, receipt printer) at software.",
      "Kabisaduhin ang 12 bahagi ng screen: Transaction No, Cashier ID, Branch Code, Barcode input, Textfield area, POS Terminal, Function Keys panel, Line item table, Total Sales, Current Date, Total Quantity, at Time.",
      "Gamitin ang F5 (Option / Next Option) para lumipat paharap sa Main -> 2nd -> 3rd -> 4th Screen, F11 (Page Up) para bumalik (o tumalon mula Main direkta sa 4th Screen), at F12 (Page Down) para bumalik agad sa Main Screen.",
      "Obserbahan kung paano nag-a-update ang Line Item Table, ang itim/berdeng real-time Subtotal & Price Display, at ang Total Qty / Total Sales sa ibaba kapag nag-scan ng test item.",
    ],
    keyCallouts: [
      "F5: Option / Susunod na Pahina",
      "F11: Page Up (Pabalik / Talon sa 4th)",
      "F12: Page Down (Balik sa Main)",
    ],
    visualCaptions: [
      "Bahagi ng POS Screen: Mga pangunahing rehiyon tulad ng Transaction Info, Barcode Scanner Box, Function Keys Panel, at Totals Display.",
    ],
  },
  "les-2-1": {
    title: "Pag-verify sa Pagsisimula ng Araw (Start of Day)",
    objective: "Isagawa ang tamang start-of-day sequence at kumpirmahin ang tamang petsa at oras pagbukas ng terminal.",
    instructions: [
      "Pag-boot ng terminal, siguraduhin na tugma ang POS Date & Time sa kasalukuyang oras ng pagbubukas ng tindahan.",
      "Kung mali ang petsa/oras, lalabas ang babalang 'Kindly contact the Service Desk' kapag pinili ang 'NO' (pindutin ang ESC o Enter pagkatapos maayos). Kapag tama, pindutin ang TAB para i-highlight ang 'YES' at pindutin ang ENTER.",
      "Pindutin ang CTRL + ALT + C para isara ang setup dialog. Ipapakita ng terminal ang 'POS Reloader'.",
      "Pindutin ang F5 para i-reload ang page at pumunta sa USER LOGIN screen.",
    ],
    keyCallouts: [
      "TAB: Lipat sa Yes/No",
      "ENTER: Kumpirmahin",
      "CTRL+ALT+C: Isara ang setup window",
      "F5: I-reload papuntang Login",
    ],
    visualCaptions: [
      "Hakbang 1: Suriin ang POS Date & Time, pindutin ang TAB para piliin ang [Yes], at pindutin ang ENTER.",
      "Hakbang 2: Mensaheng tapos na ang Start of Day setup na may gabay sa pagsara ng window.",
      "Hakbang 3: Pindutin ang Ctrl+Alt+C para isara ang setup window. Lalabas ang 'POS Reloader'. Pindutin ang F5 para pumunta sa User Login.",
    ],
  },
  "les-2-2": {
    title: "Pag-login ng Cashier at Ligtas na Pag-logout",
    objective: "Sundin ang tamang F5 -> F8 sequence para ligtas na maka-sign out sa iyong terminal.",
    instructions: [
      "Ilagay ang iyong assigned employee username at password para mag-log in.",
      "Para mag-log out: Pindutin ang F5 (Option) mula sa Main screen para buksan ang 2nd screen.",
      "Pindutin ang F8 (Logout).",
      "Pindutin ang TAB para ilipat ang focus sa 'YES' button, pagkatapos ay pindutin ang ENTER para kumpirmahin.",
      "Siguraduhing bumalik ang terminal sa User Login window na handa para sa susunod na shift.",
    ],
    keyCallouts: [
      "F5: Option",
      "F8: Logout (nasa 2nd page)",
      "TAB -> ENTER: Kumpirmahin",
    ],
    visualCaptions: [
      "Cashier Login: Ilagay ang employee username (hal. 241209) at password para buksan ang POS register.",
      "Logout Hakbang 1: Sa Main Screen, pindutin ang F5 (Option) para buksan ang 2nd Screen.",
      "Logout Hakbang 2: Sa 2nd Screen, pindutin ang F8 (Logout).",
      "Logout Hakbang 3: 'Are you sure you want to LOGOUT?' Pindutin ang TAB papuntang [Yes], at pindutin ang ENTER.",
      "Logout Hakbang 4: Pagkatapos mag-logout, babalik ang terminal sa User Login para sa susunod na shift.",
    ],
  },
  "les-3-1": {
    title: "Paghahanap ng Produkto (SRP at Promo)",
    objective: "Maghanap ng item nang hindi agad pumapasok sa active sale para ma-check ang presyo o promo.",
    instructions: [
      "Pindutin ang F2 (Lookup) mula sa main POS screen — magbubukas ito sa F2 SKU / Barcode mode.",
      "Sa F2 (SKU / Barcode) mode: i-scan o i-type ang GTIN/SKU (hal. 'NBS-BK-001') sa 'Look for:' at pindutin ang ENTER.",
      "Pindutin ang F3 sa loob ng Lookup para lumipat sa Description search: mag-type ng keyword ng pamagat (hal. 'harvard') at pindutin ang ENTER.",
      "Pindutin ang F4 sa loob ng Lookup para lumipat sa Author / Brand search: mag-type ng author o brand (hal. 'Casio') at pindutin ang ENTER.",
      "Makikita sa PROMO column sa kanan ang active promotional price katabi ng regular SRP. Pindutin ang Alt+Enter (CONTINUE) o i-double-click ang row para idagdag sa benta, o pindutin ang ALT+B (CANCEL) para lumabas nang hindi nagdadagdag.",
    ],
    keyCallouts: [
      "F2: Buksan ang Lookup / SKU Search",
      "F3 (sa Lookup): Description search",
      "F4 (sa Lookup): Author search",
      "Alt+Enter: Continue (Idagdag ang Item)",
      "Alt+B: Kanselahin ang Lookup",
    ],
    visualCaptions: [
      "F2 SKU/BARCODE - Maghanap ng item gamit ang GTIN barcode o SKU number. Makikita ang SKU, Description, Author, SRP, at active PROMO price.",
      "F3 DESCRIPTION - Mag-type ng keyword (hal. 'harvard') para mahanap ang item. Ang naka-highlight na row ang napiling item (gamit ang F11/F12), at makikita sa PROMO column ang promo price.",
    ],
  },
  "les-3-2": {
    title: "NBS Loyalty (LNC at LNQR)",
    objective: "Tamang pagtatanong at pag-tag ng loyalty membership ng customer at pagkumpleto ng LNQR flow habang nagbabayad.",
    instructions: [
      "I-scan o ilagay ang mga item sa active register, pagkatapos ay pindutin ang F4 (Payment) para magpatuloy sa bayad.",
      "Unang lalabas ang BONUS BUY LIST. Kung walang napiling bag, pindutin ang Alt+B (o i-click ang [CANCEL]) at kumpirmahin ang [Yes] para bumalik sa Main Screen (gamitin lang ang [OK] Alt+Enter kapag may naka-check na bonus bag).",
      "Pindutin muli ang F4 (Payment). Lalabas ang 'Choose Option' loyalty dialog — tanungin ang customer kung may NBS Loyalty membership sila:",
      "  • Pindutin ang 1 - kung WALANG loyalty card o QR code ang customer.",
      "  • Pindutin ang 2 - kung may pisikal na Laking National Card (LNC) ang customer.",
      "  • Pindutin ang 3 - kung may LNQR o LNQR Plus (mobile app QR code) ang customer.",
      "Para sa LNQR (option 3): Magbubukas ang LNQR input screen. I-scan ang QR code ng customer O i-type nang mano-mano ang LNQR code. Pindutin ang TAB papuntang [Ok], at pindutin ang ENTER.",
      "Lalabas ang Cash Payment Details screen. Ilagay ang halagang ibinayad ng customer at pindutin ang ENTER para iproseso.",
      "Magiging pula at kukurap ang 'Change' field — ibigay ang sukli sa customer. Lalabas ang 'Dont press any key.. Please wait...' habang kumokonekta sa LNQR server.",
      "May lalabas na popup: 'LNQR has been updated!' na nagpapakita ng pangalan ng customer, card number, dating balance, na-earn na Sulit Coins, at bagong balance. Pindutin ang ENTER o i-click ang OK.",
      "Babalik ang terminal sa active register home. Kusang mai-print sa resibo ang LNQR details kabilang ang na-earn na Sulit Coins.",
    ],
    keyCallouts: [
      "F4: Payment",
      "Alt+B: Bonus Buy Cancel",
      "Alt+Enter: Bonus Buy OK (kapag naka-check)",
      "1: Walang Loyalty",
      "2: LNC Card",
      "3: LNQR / LNQR Plus",
      "TAB: Lipat sa OK",
      "ENTER: Kumpirmahin",
    ],
    visualCaptions: [
      "Pagkatapos isara ang Bonus Buy List, pindutin muli ang F4 (Payment) para lumabas ang 'Choose Option' loyalty dialog (1 None, 2 LNC Card, 3 LNQR).",
      "Pindutin ang 3 para piliin ang LNQR / LNQR PLUS.",
      "Lalabas ang LNQR / LNQR PLUS input screen. I-scan ang QR code o i-type ang Customer LNQR Code, pindutin ang TAB papuntang OK, at ENTER.",
      "Pagkatapos ng LNQR, lalabas ang Cash Payment Details. Ilagay ang tendered amount sa 'Enter Amount' at pindutin ang ENTER.",
      "Kukurap nang pula ang 'Change' para ipakita ang sukli. Hintayin ang 'Dont press any key.. Please wait...' habang nag-a-update ang LNQR server.",
      "Lalabas ang 'LNQR has been updated!' na may detalye ng customer at na-earn na Sulit Coins. Pindutin ang ENTER o OK.",
      "Naka-print din sa resibo ang LNQR No. at Earned Sulit Coins bilang kumpirmasyon.",
    ],
  },
  "les-4-1": {
    title: "Paglalagay ng Quantity at Pag-scan ng Item",
    objective: "Magtakda ng item multiplier bago mag-scan para maiwasan ang paulit-ulit na pag-scan ng parehong item.",
    instructions: [
      "Kapag bumili ang customer ng maraming piraso ng parehong item, pindutin ang F3 (Quantity).",
      "I-type ang bilang ng piraso (hal. 5) at pindutin ang ENTER.",
      "I-scan ang barcode o ilagay ang item SKU. Agad mare-record ang item kasama ang tamang quantity.",
      "Kapag hindi naubos ng customer ang halaga ng coupon o voucher, pindutin ang F6 (Non Mdse) upang i-record ang natirang balance/variance ng coupon at makagawa ng bagong coupon bilang sukli para sa nagamit na coupon, ilagay ang quantity, at pindutin ang Alt+Enter (o i-click ang OK) upang idagdag at bumalik sa Main Screen.",
    ],
    keyCallouts: [
      "F3: Quantity Entry",
      "F6: Non Mdse (Coupon Change)",
      "ENTER / Alt+Enter: Kumpirmahin",
    ],
    visualCaptions: [
      "Main POS Function Key Panel: Matatagpuan ang F3 Quantity key sa kanang function keys panel.",
      "Hakbang 1: Pindutin ang F3 (Quantity) para buksan ang quantity prompt, ilagay ang dami (hal. 5), at pindutin ang ENTER.",
      "Hakbang 2: I-scan o i-type ang item barcode. Kusang mare-record ang item na may tamang quantity.",
      "Video Walkthrough: Pagpapakita ng paggamit ng F3 quantity multiplier at pag-scan ng mga item.",
    ],
  },
  "les-4-2": {
    title: "Item Void at Transaction Void (Manager Override)",
    objective: "Isagawa ang pag-kansela ng isang line item o buong transaksyon nang may pahintulot ng supervisor.",
    instructions: [
      "Para sa pagkansela ng isang item: Pindutin ang F7 (Item Void). Hihingi ang system ng manager override.",
      "Piliin ang reason code ng pagkansela at pindutin ang Alt + Enter.",
      "I-highlight ang item na kakanselahin at pindutin ang Alt + Enter. Mapapansin na magiging negatibo ang quantity nito sa transaction log.",
      "Para sa pagkansela ng buong transaksyon: Pindutin ang F8 (Trx Void), kumpirmahin gamit ang 'Y', ilagay ang manager override, at piliin ang dahilan.",
    ],
    keyCallouts: [
      "F7: Item Void",
      "F8: Trx Void",
      "Alt+Enter: Piliin at Kumpirmahin",
    ],
    visualCaptions: [
      "Item Void Hakbang 1: Pindutin ang F7 (Item Void). Ilagay ang Manager Override username at password, at pindutin ang ENTER.",
      "Item Void Hakbang 2: Piliin ang reason code mula sa menu at pindutin ang Alt + Enter.",
      "Item Void Hakbang 3: I-highlight ang line item na i-vo-void at pindutin ang Alt + Enter.",
      "Item Void Hakbang 4: Magiging negatibo ang quantity at may pulang guhit sa transaction log.",
      "Video Walkthrough: Pagpapakita ng single line Item Void gamit ang supervisor override.",
      "Trx Void Hakbang 1: Pindutin ang F8 (Trx Void) para kanselahin ang buong benta. Ilagay ang Manager Override at pindutin ang ENTER.",
      "Trx Void Hakbang 2: Pindutin ang Y para kumpirmahin ang pagkansela ng buong transaksyon.",
      "Trx Void Hakbang 3: Piliin ang reason code at pindutin ang Alt + Enter para tapusin.",
      "Video Walkthrough: Pagpapakita ng buong Transaction Void.",
    ],
  },
  "les-5-1": {
    title: "Mga Transaction Discount (Senior Citizen, PWD, Employee)",
    objective: "Magbigay ng tamang statutory o company discount na may pahintulot ng supervisor.",
    instructions: [
      "Pindutin ang F5 (Option) mula sa Main Screen para pumasok sa 2nd Page.",
      "Para sa awtorisadong pagbabago ng presyo: Pindutin ang F3 (Price Change) sa 2nd Page, ilagay ang manager override, ilagay ang bagong unit price at dahilan, at kumpirmahin (kusang babalik sa Main Screen).",
      "Pindutin ang F6 (TRX Disc) para buksan ang listahan ng mga discount category.",
      "Piliin ang tamang diskwento (hal. Senior 20%, Employee 15%, LNQR Family Discount), ilagay ang ID details ng customer at manager override kapag hiningi, at pindutin ang Alt + Enter (kusang babalik sa Main Screen).",
    ],
    keyCallouts: [
      "F5: Option",
      "F3: Price Change",
      "F6: TRX Disc",
      "Alt+Enter: Ilapat",
    ],
    visualCaptions: [
      "Pindutin ang F5 (Option) mula sa Main Screen para makapasok sa 2nd Screen function keys.",
      "Hakbang 1: Pumunta sa 2nd Screen ng POS register.",
      "Hakbang 2: Pindutin ang F6 (TRX Disc) para buksan ang discount category list.",
      "Hakbang 3: Piliin ang tamang discount type (hal. Senior 20%) at pindutin ang Alt + Enter.",
      "Hakbang 4: Ilagay ang Manager Override credentials kapag hiningi para mailapat ang diskwento.",
      "LNQR Family Discount: Pumunta sa 2nd Screen at pindutin ang F6 (TRX Disc).",
      "Piliin ang ZQFD LNQR Family Discount option at pindutin ang Alt + Enter.",
      "Ilagay ang Manager Override credentials, pindutin ang TAB papuntang YES, at ENTER para kumpirmahin.",
      "I-scan o i-type ang mobile QR code ng customer, pindutin ang TAB papuntang OK, at ENTER.",
    ],
  },
  "les-5-2": {
    title: "Suspend, Recall, at Reprint",
    objective: "Ligtas na i-hold ang transaksyon kapag may kukunin pang item ang customer, at mag-reprint ng lumang resibo.",
    instructions: [
      "Para mag-suspend: Pindutin ang F9 (Suspend) sa Main Page, pagkatapos ay pindutin ang ENTER.",
      "Para mag-recall: Pumunta sa 2nd Page gamit ang F5, pindutin ang F7 (Recall), magbigay ng manager override, at piliin ang naka-suspend na transaksyon (kusang babalik sa Main Screen).",
      "Para buksan ang cash drawer nang walang benta: Pindutin ang F9 (No Sale) sa 2nd Page at ilagay ang manager override credentials (kusang babalik sa Main Screen).",
      "Para mag-reprint: Pindutin ang F2 (Reprint) sa 2nd Page, magbigay ng manager override, piliin ang OR number, at kumpirmahin.",
    ],
    keyCallouts: [
      "F9 (Main): Suspend",
      "F7 (2nd): Recall",
      "F9 (2nd): No Sale",
      "F2 (2nd): Reprint",
    ],
    visualCaptions: [
      "Suspend: Sa Main Screen, pindutin ang F9 (Suspend) para pansamantalang i-hold ang kasalukuyang benta.",
      "Recall Hakbang 1: Pumunta sa 2nd Screen (F5) at pindutin ang F7 (Recall) para makita ang mga naka-hold na transaksyon.",
      "Recall Hakbang 2: Hihingi ang system ng manager override. Ilagay ang credentials at pindutin ang ENTER.",
      "Recall Hakbang 3: Piliin ang naka-suspend na transaksyon at pindutin ang Alt + Enter para ibalik.",
      "Video Walkthrough: Pagpapakita ng Suspend sa Main Screen at Recall sa 2nd Screen.",
      "Reprint Hakbang 1: Sa 2nd Screen, pindutin ang F2 (Reprint) para mag-reprint ng Official Receipt.",
      "Reprint Hakbang 2: Ilagay ang Manager Override, pindutin ang TAB papuntang YES, at ENTER.",
      "Reprint Hakbang 3: Piliin ang nais na Official Receipt (OR) Number at pindutin ang ENTER para mag-print ng kopya.",
    ],
  },
  "les-6-1": {
    title: "Cashier (Y) Reading at Terminal (Z) Reading",
    objective: "Isagawa ang pormal na shift at daily reconciliation na kinakailangan ng store accounting.",
    instructions: [
      "Pindutin nang dalawang beses ang F5 para lumipat mula Main -> 2nd -> 3rd Page.",
      "Para suriin ang electronic journals: Pindutin ang F4 (Trx Journal) o F6 (Sales Journal) sa 3rd Page.",
      "Para sa palitan ng shift ng cashier: Pindutin ang F8 (Cashier Reading) para i-print ang Y-Reading summary.",
      "Para sa pagsasara ng terminal: Pindutin ang F9 (Terminal Reading), pindutin ang Tab papuntang YES, at pindutin ang ENTER para mabuo ang panghuling Z-Reading.",
    ],
    keyCallouts: [
      "F4 (3rd): Trx Journal",
      "F6 (3rd): Sales Journal",
      "F8 (3rd): Cashier Y-Reading",
      "F9 (3rd): Terminal Z-Reading",
    ],
    visualCaptions: [
      "3rd Screen Function Keys: Post Void, Sales Journal, Cashier Reading, Terminal Reading, at SDV.",
      "Pindutin ang F5 nang dalawang beses para umabot sa 3rd Screen: Main -> 2nd -> 3rd.",
      "Cashier Y-Reading Hakbang 1: Pindutin ang F8 (Cashier Rdg) sa 3rd Screen para sa end-of-shift reconciliation.",
      "Cashier Y-Reading Hakbang 2: Pindutin ang ENTER para i-print ang shift Y-Reading summary.",
      "Terminal Z-Reading Hakbang 1: Pindutin ang F9 (Terminal Rdg) sa 3rd Screen para sa pagsasara ng tindahan.",
      "Terminal Z-Reading Hakbang 2: Pindutin ang TAB papuntang [Yes] sa confirmation prompt, at pindutin ang ENTER.",
      "Terminal Z-Reading Hakbang 3: Pindutin ang ENTER para i-print ang panghuling Z-Reading report.",
    ],
  },
  "les-6-2": {
    title: "Sales Data Verification (SDV)",
    objective: "Siguraduhing tugma ang sales header, item detail, at payment tallies sa POS database.",
    instructions: [
      "Para kanselahin ang isang natapos nang resibo mula sa mas maagang bahagi ng shift: Pindutin ang F2 (Post Void) sa 3rd Page, ilagay ang Manager Override credentials, at kumpirmahin ang OR number.",
      "Sa 3rd Page, pindutin ang F10 (SDV) para i-verify ang Sales Data.",
      "Suriin kung nakalagay na 'Tally' ang mga bilang sa Header, Detail, at PayDetail.",
      "Kung may nakalagay na 'Not Tally', itala ang pagkakaiba at makipag-ugnayan agad sa Service Desk.",
    ],
    keyCallouts: [
      "F2 (3rd): Post Void",
      "F10 (3rd): SDV Check",
    ],
    visualCaptions: [
      "SDV Hakbang 1: Sa 3rd Screen, pindutin ang F10 (SDV) sa pinakailalim ng function key column.",
      "SDV Hakbang 2: Suriin ang SDV audit table at tiyaking 'Tally' ang Header, Detail, at PayDetail.",
    ],
  },
  "les-7-1": {
    title: "Mga Transaction Comment (TIN at Corporate Billing)",
    objective: "Maglagay ng BIR-compliant customer details para sa corporate o tax-exempt transactions.",
    instructions: [
      "Pindutin nang tatlong beses ang F5 para pumunta sa 4th Page (o pindutin ang F11 Page Up mula Main Screen para direkta sa 4th Page; gamitin ang F12 para bumalik sa Main).",
      "Pindutin ang F3 (TRX Comment). I-type ang rehistradong pangalan ng kumpanya ng customer, address, at TIN, pagkatapos ay pindutin ang OK (kusang babalik sa Main Screen).",
      "Para sa non-sales reference coding: Pumunta sa 4th Page at pindutin ang F4 (Non Sales), ilagay ang reference code, at kumpirmahin (kusang babalik sa Main Screen).",
      "Kusang mai-print ang mga comment na ito sa official sales invoice receipt.",
    ],
    keyCallouts: [
      "F3 (4th): TRX Comment",
      "F4 (4th): Non Sales",
      "F11: Page Up",
    ],
    visualCaptions: [
      "Pindutin ang F5 nang tatlong beses mula Main -> 2nd -> 3rd -> 4th Screen (gamitin ang F12 pabalik sa Main).",
      "Hakbang 1: Pindutin ang F3 (TRX Comment) sa 4th Screen para buksan ang corporate billing details.",
      "Hakbang 2: Ilagay ang pangalan ng kumpanya, business address, at TIN, pagkatapos ay pindutin ang OK.",
      "Hakbang 3: Mare-record ang mga detalye at kusang mai-print sa official sales invoice receipt.",
    ],
  },
  "les-7-2": {
    title: "Returns, Refunds, at Zero-Rated Transactions",
    objective: "Isagawa ang mga return at refund na may pahintulot ng supervisor at original receipt reference.",
    instructions: [
      "Para sa Returns: Pindutin ang F8 (Return) sa 4th Page, ilagay ang manager override, ilagay ang Sales Invoice (SI) ng customer, at i-scan/ilagay ang ibinabalik na GTIN.",
      "Para sa Refunds: Pindutin ang F10 (Refund), ibigay ang manager override, at ilagay ang orihinal na ORNO.",
      "Para sa Zero-Rated sales: Pindutin ang F7 (Zero Rated) bago mag-scan ng mga item upang maalis ang VAT.",
    ],
    keyCallouts: [
      "F8 (4th): Return",
      "F10 (4th): Refund",
      "F7 (4th): Zero Rated",
    ],
    visualCaptions: [
      "Return Hakbang 1: Pindutin ang F8 (Return) sa 4th Screen at ilagay ang Manager Override.",
      "Return Hakbang 2: Piliin ang return reason code, ilagay ang Sales Invoice (SI) number, at pindutin ang Alt + Enter.",
      "Return Hakbang 3: Ilagay ang GTIN barcode ng ibinalik na item; kusang makikita ang credit calculation pagpindot ng ENTER.",
      "Video Walkthrough: Pagpapakita ng Item Return/Exchange workflow.",
      "Refund Hakbang 1: Pindutin ang F10 (Refund) sa 4th Screen at ilagay ang Manager Override.",
      "Refund Hakbang 2: Ilagay ang orihinal na Official Receipt (OR) Number para sa refund, at pindutin ang Alt + Enter.",
      "Zero-Rated Hakbang 1: Pindutin ang F7 (Zero Rated) sa 4th Screen bago mag-scan ng items.",
      "Zero-Rated Hakbang 2: Ilagay ang Manager Override para sa VAT-exempt status.",
      "Zero-Rated Hakbang 3: I-scan ang mga tax-exempt items kung saan kusang tinatanggal ang VAT sa kabuuan.",
      "Video Walkthrough: Pagpapakita ng Zero-Rated sale authorization at pag-scan.",
    ],
  },
  "les-8-1": {
    title: "Pagbabayad ng Cash at Pagsusukli",
    objective: "Pumunta sa payment screen, ilagay ang halagang ibinayad, at kumpirmahin ang tamang sukli.",
    instructions: [
      "Kapag naipasok na lahat ng item sa Main screen, pindutin ang F4 (Payment).",
      "Unang lalabas ang BONUS BUY LIST. Kung walang napiling bag, pindutin ang Alt+B (o i-click ang [CANCEL]) at kumpirmahin ang [Yes] para bumalik sa Main Screen (gamitin lang ang [OK] Alt+Enter kapag may naka-check na bonus bag).",
      "Pindutin muli ang F4 (Payment). Sa Choose Option dialog, piliin ang option 1 (None) kung walang loyalty card ang customer (o 2 para sa LNC / 3 para sa LNQR).",
      "Sa Payment Screen, kusang naka-select na ang Cash — hindi na kailangang pindutin muli ang F2. Diretso nang i-type ang halagang ibinayad ng customer (hal. 250.00 o 500.00).",
      "Pindutin ang Enter o i-click ang [Ok] para kumpirmahin ang bayad.",
      "Tingnan ang nakalkulang sukli (Change) para sa customer at hintaying mabuo ang simulated receipt.",
    ],
    keyCallouts: [
      "F4: Payment Flow",
      "Alt+B: Bonus Buy Cancel",
      "1: None (o 2/3 para sa Loyalty)",
      "Enter: Kumpirmahin ang Cash Tender",
    ],
    visualCaptions: [
      "Payment Screen Function Keys: F1 Cancel, F2 Cash, F3 Bank Card, F5 Gift Cert, F6 Coupon, F8 Credit Memo, F9 Sulit Coins.",
      "Cash Tender: Kusang naka-select ang Cash pagbukas ng Payment Screen. Diretso nang ilagay ang halagang ibinayad ng customer.",
    ],
  },
  "les-8-2": {
    title: "Credit Card Terminal at E-Wallets (GCash / Maya)",
    objective: "Iproseso ang credit/debit card swipes at reference numbers ng mobile wallet (GCash/Maya) gamit ang F3 Bank Card.",
    instructions: [
      "Sa Payment Screen, pindutin ang F3 (Bank Card) para buksan ang listahan ng card at electronic wallet.",
      "Para sa Credit/Debit Card: Piliin ang 'CREDIT CARD' at pindutin ang [Ok]. I-swipe o ilagay ang card number at pindutin ang Enter.",
      "Tingnan ang BDO POS terminal receipt sa kanan, ilagay ang Authorization Code at Sales Slip / Invoice No., at i-click ang [Ok] para matapos ang card payment.",
      "Para sa GCash o Maya: Pindutin ang F3 (Bank Card), piliin ang 'GCASH' (o 'MAYA') at pindutin ang [Ok]. Suriin ang Amount, kopyahin ang Reference No. mula sa terminal preview, at i-click ang [Ok].",
    ],
    keyCallouts: [
      "F3: Bank Card",
      "CREDIT CARD: Swipe -> Auth Code & Slip No.",
      "GCASH / MAYA: Ilagay ang Reference No.",
    ],
    visualCaptions: [
      "Card Payment Hakbang 1: Pindutin ang F3 (Bank Card), piliin ang Credit Card, at i-swipe o ilagay ang card number.",
      "Card Payment Hakbang 2: Kopyahin ang 6-character Authorization Code at 6-digit Invoice/Sales Slip # mula sa BDO POS slip at pindutin ang Ok.",
      "GCash / Maya Tender: Pindutin ang F3 (Bank Card), piliin ang GCASH o MAYA, at ilagay ang transaction reference number mula sa terminal preview.",
    ],
  },
  "les-8-3": {
    title: "Pag-redeem ng LNQR Sulit Coins at NBS Gift Card",
    objective: "I-redeem ang LNQR Sulit Coins ng customer kasama ang split cash balance at iproseso ang NBS Gift Card / Sodexho Pass.",
    instructions: [
      "Para sa LNQR Sulit Coins: Dahil magre-redeem ng Sulit Coins ang customer, piliin ang option '3. LNQR / LNQR PLUS' sa Choose Option prompt at i-scan/kumpirmahin ang kanilang LNQR code.",
      "Sa Payment Screen, pindutin ang F3 (Bank Card), piliin ang 'LNQR Sulit Coins', at i-click ang [Ok].",
      "Ilagay o i-verify ang halaga ng Sulit Coins na ire-redeem (hal. 29.00) at ang LNQR code ng customer, pagkatapos ay i-click ang [Ok].",
      "Kusang babalik ang register sa Cash Payment Details para sa natitirang balanse. Ilagay ang ibinayad na cash at pindutin ang Enter, pagkatapos ay kumpirmahin ang 'LNQR has been updated!' dialog.",
      "Para sa NBS Gift Card: Piliin ang option '1. None', pindutin ang F3 (Bank Card), piliin ang 'NBS GIFTCARD', i-click ang [Ok], i-verify ang Voucher Amount at Voucher Code, at i-click ang [Ok].",
    ],
    keyCallouts: [
      "Option 3: LNQR / LNQR PLUS",
      "F3 -> LNQR Sulit Coins",
      "Split Tender: Coins + Cash Balance",
      "F3 -> NBS GIFTCARD",
    ],
    visualCaptions: [
      "Sulit Coins Hakbang 1: Pindutin ang F3 (Bank Card), piliin ang LNQR Sulit Coins, pindutin ang TAB papuntang [Ok], at pindutin ang ENTER.",
      "Sulit Coins Hakbang 2: Ilagay ang halaga ng Sulit Coins na ire-redeem, i-scan ang LNQR barcode, at kumpirmahin bago bayaran ang natitirang cash balance.",
      "Sulit Coins Hakbang 3: Ipapakita ang confirmation popup ng natapos na LNQR processing; pindutin ang ENTER para tapusin ang resibo.",
      "NBS Gift Card: Pindutin ang F3 (Bank Card), piliin ang NBS GIFTCARD, at ilagay ang Voucher Amount at Voucher Code.",
      "Video Walkthrough: Pagpapakita ng buong LNQR Sulit Coins loyalty redemption at pagbabayad.",
    ],
  },
  "les-8-4": {
    title: "Gift Certificates (F5), Promo Coupons (F6) at Credit Memo (F8)",
    objective: "Tumanggap ng papel na Gift Certificates, Promotional Coupons (With/Without Series), at store Credit Memos.",
    instructions: [
      "Para sa Gift Certificates: Sa Payment Screen, pindutin ang F5 (Gift Cert.), piliin ang GC Type (hal. NBS Gift Certificate), ilagay ang GC Number at Amount, at pindutin ang Enter o i-click ang [Ok].",
      "Para sa Promotional Coupons: Pindutin ang F6 (Coupon), piliin ang 'Without Series' o 'With Series' sa Coupon Type dropdown, piliin ang promo campaign (hal. NBS), i-verify ang halaga, at pindutin ang Enter o i-click ang [Ok].",
      "Para sa Store Credit Memo: Pindutin ang F8 (Credit Memo), i-verify ang Credit Memo number (hal. CM-2026-0041) at halaga mula sa nakaraang return, at pindutin ang Enter o i-click ang [Ok].",
    ],
    keyCallouts: [
      "F5: Gift Cert.",
      "F6: Promo Coupon (With/Without Series)",
      "F8: Credit Memo",
    ],
    visualCaptions: [
      "Gift Certificate Hakbang 1: Pindutin ang F5 (Gift Cert), piliin ang uri ng certificate, at i-scan o i-type ang GC number.",
      "Gift Certificate Hakbang 2: Punan ang mga hinihinging detalye ng gift certificate.",
      "Coupon Hakbang 1: Pindutin ang F6 (Coupon), piliin ang kategorya (With Series / Without Series), at piliin ang promotional coupon type.",
      "Coupon Hakbang 2: Punan ang mga detalye ng promotional coupon at pindutin ang Process Payment / Ok.",
    ],
  },
  "les-9-1": {
    title: "Panghuling Pagbabalik-aral at Kahandaan sa Assessment",
    objective: "Tiyakin ang pagkaunawa sa lahat ng function key mappings at maghanda para sa practical simulation.",
    instructions: [
      "Balikan ang mga function key sa lahat ng 5 POS screens (Main, 2nd, 3rd, 4th, Payment).",
      "Siguraduhing tanda kung aling mga gawain ang nangangailangan ng manager override (Item Void, Trx Void, Reprint, Discounts, Readings).",
      "Magpatuloy sa Practical POS Simulator upang tapusin ang iyong may-gradong cashier scenario.",
    ],
    keyCallouts: [
      "Simulan ang Practical Assessment: Subukan ang iyong galing",
    ],
    visualCaptions: [
      "Preview ng Practical Certification Assessment: Komprehensibong pagsusuri sa lahat ng 5 POS screens at function keys.",
    ],
  },
};
