/**
 * Comprehensive Country Data
 * Contains all 195+ internationally recognized countries with ISO 3166-1 alpha-2 codes
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2 code
  name: string;
  flag: string; // Unicode flag emoji
  region: string;
  subregion: string;
  population?: number;
  capital?: string;
}

export const countries: Country[] = [
  // Africa
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', region: 'Africa', subregion: 'Northern Africa', capital: 'Algiers' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', region: 'Africa', subregion: 'Middle Africa', capital: 'Luanda' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', region: 'Africa', subregion: 'Western Africa', capital: 'Porto-Novo' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', region: 'Africa', subregion: 'Southern Africa', capital: 'Gaborone' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', region: 'Africa', subregion: 'Western Africa', capital: 'Ouagadougou' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', region: 'Africa', subregion: 'Eastern Africa', capital: 'Gitega' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', region: 'Africa', subregion: 'Western Africa', capital: 'Praia' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', region: 'Africa', subregion: 'Middle Africa', capital: 'Yaoundé' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', region: 'Africa', subregion: 'Middle Africa', capital: 'Bangui' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', region: 'Africa', subregion: 'Middle Africa', capital: "N'Djamena" },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', region: 'Africa', subregion: 'Eastern Africa', capital: 'Moroni' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', region: 'Africa', subregion: 'Middle Africa', capital: 'Brazzaville' },
  { code: 'CD', name: 'Congo (Democratic Republic)', flag: '🇨🇩', region: 'Africa', subregion: 'Middle Africa', capital: 'Kinshasa' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', region: 'Africa', subregion: 'Western Africa', capital: 'Yamoussoukro' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', region: 'Africa', subregion: 'Eastern Africa', capital: 'Djibouti' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Africa', subregion: 'Northern Africa', capital: 'Cairo' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', region: 'Africa', subregion: 'Middle Africa', capital: 'Malabo' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', region: 'Africa', subregion: 'Eastern Africa', capital: 'Asmara' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', region: 'Africa', subregion: 'Southern Africa', capital: 'Mbabane' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', region: 'Africa', subregion: 'Eastern Africa', capital: 'Addis Ababa' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', region: 'Africa', subregion: 'Middle Africa', capital: 'Libreville' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', region: 'Africa', subregion: 'Western Africa', capital: 'Banjul' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', region: 'Africa', subregion: 'Western Africa', capital: 'Accra' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', region: 'Africa', subregion: 'Western Africa', capital: 'Conakry' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', region: 'Africa', subregion: 'Western Africa', capital: 'Bissau' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'Africa', subregion: 'Eastern Africa', capital: 'Nairobi' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', region: 'Africa', subregion: 'Southern Africa', capital: 'Maseru' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', region: 'Africa', subregion: 'Western Africa', capital: 'Monrovia' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', region: 'Africa', subregion: 'Northern Africa', capital: 'Tripoli' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', region: 'Africa', subregion: 'Eastern Africa', capital: 'Antananarivo' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', region: 'Africa', subregion: 'Eastern Africa', capital: 'Lilongwe' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', region: 'Africa', subregion: 'Western Africa', capital: 'Bamako' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷', region: 'Africa', subregion: 'Western Africa', capital: 'Nouakchott' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', region: 'Africa', subregion: 'Eastern Africa', capital: 'Port Louis' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', region: 'Africa', subregion: 'Northern Africa', capital: 'Rabat' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', region: 'Africa', subregion: 'Eastern Africa', capital: 'Maputo' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', region: 'Africa', subregion: 'Southern Africa', capital: 'Windhoek' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', region: 'Africa', subregion: 'Western Africa', capital: 'Niamey' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa', subregion: 'Western Africa', capital: 'Abuja' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', region: 'Africa', subregion: 'Eastern Africa', capital: 'Kigali' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', region: 'Africa', subregion: 'Middle Africa', capital: 'São Tomé' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', region: 'Africa', subregion: 'Western Africa', capital: 'Dakar' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', region: 'Africa', subregion: 'Eastern Africa', capital: 'Victoria' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', region: 'Africa', subregion: 'Western Africa', capital: 'Freetown' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', region: 'Africa', subregion: 'Eastern Africa', capital: 'Mogadishu' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa', subregion: 'Southern Africa', capital: 'Cape Town' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', region: 'Africa', subregion: 'Eastern Africa', capital: 'Juba' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', region: 'Africa', subregion: 'Northern Africa', capital: 'Khartoum' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', region: 'Africa', subregion: 'Eastern Africa', capital: 'Dodoma' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', region: 'Africa', subregion: 'Western Africa', capital: 'Lomé' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', region: 'Africa', subregion: 'Northern Africa', capital: 'Tunis' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', region: 'Africa', subregion: 'Eastern Africa', capital: 'Kampala' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', region: 'Africa', subregion: 'Eastern Africa', capital: 'Lusaka' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', region: 'Africa', subregion: 'Eastern Africa', capital: 'Harare' },

  // Asia
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', region: 'Asia', subregion: 'Southern Asia', capital: 'Kabul' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', region: 'Asia', subregion: 'Western Asia', capital: 'Yerevan' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', region: 'Asia', subregion: 'Western Asia', capital: 'Baku' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', region: 'Asia', subregion: 'Western Asia', capital: 'Manama' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', region: 'Asia', subregion: 'Southern Asia', capital: 'Dhaka' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', region: 'Asia', subregion: 'Southern Asia', capital: 'Thimphu' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Bandar Seri Begawan' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Phnom Penh' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia', subregion: 'Eastern Asia', capital: 'Beijing' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', region: 'Asia', subregion: 'Western Asia', capital: 'Nicosia' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', region: 'Asia', subregion: 'Western Asia', capital: 'Tbilisi' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia', subregion: 'Southern Asia', capital: 'New Delhi' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Jakarta' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', region: 'Asia', subregion: 'Southern Asia', capital: 'Tehran' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', region: 'Asia', subregion: 'Western Asia', capital: 'Baghdad' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Asia', subregion: 'Western Asia', capital: 'Jerusalem' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', subregion: 'Eastern Asia', capital: 'Tokyo' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', region: 'Asia', subregion: 'Western Asia', capital: 'Amman' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', region: 'Asia', subregion: 'Central Asia', capital: 'Nur-Sultan' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', region: 'Asia', subregion: 'Western Asia', capital: 'Kuwait City' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', region: 'Asia', subregion: 'Central Asia', capital: 'Bishkek' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Vientiane' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', region: 'Asia', subregion: 'Western Asia', capital: 'Beirut' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Kuala Lumpur' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', region: 'Asia', subregion: 'Southern Asia', capital: 'Malé' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', region: 'Asia', subregion: 'Eastern Asia', capital: 'Ulaanbaatar' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Naypyidaw' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', region: 'Asia', subregion: 'Southern Asia', capital: 'Kathmandu' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵', region: 'Asia', subregion: 'Eastern Asia', capital: 'Pyongyang' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', region: 'Asia', subregion: 'Western Asia', capital: 'Muscat' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', region: 'Asia', subregion: 'Southern Asia', capital: 'Islamabad' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸', region: 'Asia', subregion: 'Western Asia', capital: 'Ramallah' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Manila' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', region: 'Asia', subregion: 'Western Asia', capital: 'Doha' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Asia', subregion: 'Western Asia', capital: 'Riyadh' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Singapore' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia', subregion: 'Eastern Asia', capital: 'Seoul' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', region: 'Asia', subregion: 'Southern Asia', capital: 'Sri Jayawardenepura Kotte' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', region: 'Asia', subregion: 'Western Asia', capital: 'Damascus' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'Asia', subregion: 'Eastern Asia', capital: 'Taipei' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯', region: 'Asia', subregion: 'Central Asia', capital: 'Dushanbe' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Bangkok' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Dili' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Asia', subregion: 'Western Asia', capital: 'Ankara' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲', region: 'Asia', subregion: 'Central Asia', capital: 'Ashgabat' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Asia', subregion: 'Western Asia', capital: 'Abu Dhabi' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', region: 'Asia', subregion: 'Central Asia', capital: 'Tashkent' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Asia', subregion: 'South-Eastern Asia', capital: 'Hanoi' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', region: 'Asia', subregion: 'Western Asia', capital: 'Sana\'a' },

  // Europe
  { code: 'AL', name: 'Albania', flag: '🇦🇱', region: 'Europe', subregion: 'Southern Europe', capital: 'Tirana' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', region: 'Europe', subregion: 'Southern Europe', capital: 'Andorra la Vella' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'Europe', subregion: 'Western Europe', capital: 'Vienna' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', region: 'Europe', subregion: 'Eastern Europe', capital: 'Minsk' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', region: 'Europe', subregion: 'Western Europe', capital: 'Brussels' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', region: 'Europe', subregion: 'Southern Europe', capital: 'Sarajevo' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', region: 'Europe', subregion: 'Eastern Europe', capital: 'Sofia' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', region: 'Europe', subregion: 'Southern Europe', capital: 'Zagreb' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', region: 'Europe', subregion: 'Eastern Europe', capital: 'Prague' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', region: 'Europe', subregion: 'Northern Europe', capital: 'Copenhagen' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', region: 'Europe', subregion: 'Northern Europe', capital: 'Tallinn' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', region: 'Europe', subregion: 'Northern Europe', capital: 'Helsinki' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', subregion: 'Western Europe', capital: 'Paris' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', subregion: 'Western Europe', capital: 'Berlin' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', region: 'Europe', subregion: 'Southern Europe', capital: 'Athens' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', region: 'Europe', subregion: 'Eastern Europe', capital: 'Budapest' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', region: 'Europe', subregion: 'Northern Europe', capital: 'Reykjavik' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'Europe', subregion: 'Northern Europe', capital: 'Dublin' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe', subregion: 'Southern Europe', capital: 'Rome' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰', region: 'Europe', subregion: 'Southern Europe', capital: 'Pristina' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', region: 'Europe', subregion: 'Northern Europe', capital: 'Riga' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', region: 'Europe', subregion: 'Western Europe', capital: 'Vaduz' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', region: 'Europe', subregion: 'Northern Europe', capital: 'Vilnius' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', region: 'Europe', subregion: 'Western Europe', capital: 'Luxembourg' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', region: 'Europe', subregion: 'Southern Europe', capital: 'Valletta' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', region: 'Europe', subregion: 'Eastern Europe', capital: 'Chișinău' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', region: 'Europe', subregion: 'Western Europe', capital: 'Monaco' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', region: 'Europe', subregion: 'Southern Europe', capital: 'Podgorica' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe', subregion: 'Western Europe', capital: 'Amsterdam' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', region: 'Europe', subregion: 'Southern Europe', capital: 'Skopje' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Europe', subregion: 'Northern Europe', capital: 'Oslo' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'Europe', subregion: 'Eastern Europe', capital: 'Warsaw' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe', subregion: 'Southern Europe', capital: 'Lisbon' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', region: 'Europe', subregion: 'Eastern Europe', capital: 'Bucharest' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Europe', subregion: 'Eastern Europe', capital: 'Moscow' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', region: 'Europe', subregion: 'Southern Europe', capital: 'San Marino' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', region: 'Europe', subregion: 'Southern Europe', capital: 'Belgrade' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', region: 'Europe', subregion: 'Eastern Europe', capital: 'Bratislava' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', region: 'Europe', subregion: 'Southern Europe', capital: 'Ljubljana' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', subregion: 'Southern Europe', capital: 'Madrid' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe', subregion: 'Northern Europe', capital: 'Stockholm' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', subregion: 'Western Europe', capital: 'Bern' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', region: 'Europe', subregion: 'Eastern Europe', capital: 'Kyiv' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', subregion: 'Northern Europe', capital: 'London' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦', region: 'Europe', subregion: 'Southern Europe', capital: 'Vatican City' },

  // North America
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', region: 'Americas', subregion: 'Caribbean', capital: 'Saint John\'s' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', region: 'Americas', subregion: 'Caribbean', capital: 'Nassau' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', region: 'Americas', subregion: 'Caribbean', capital: 'Bridgetown' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', region: 'Americas', subregion: 'Central America', capital: 'Belmopan' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', subregion: 'Northern America', capital: 'Ottawa' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', region: 'Americas', subregion: 'Central America', capital: 'San José' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', region: 'Americas', subregion: 'Caribbean', capital: 'Havana' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲', region: 'Americas', subregion: 'Caribbean', capital: 'Roseau' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', region: 'Americas', subregion: 'Caribbean', capital: 'Santo Domingo' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', region: 'Americas', subregion: 'Central America', capital: 'San Salvador' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩', region: 'Americas', subregion: 'Caribbean', capital: 'Saint George\'s' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', region: 'Americas', subregion: 'Central America', capital: 'Guatemala City' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', region: 'Americas', subregion: 'Caribbean', capital: 'Port-au-Prince' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', region: 'Americas', subregion: 'Central America', capital: 'Tegucigalpa' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', region: 'Americas', subregion: 'Caribbean', capital: 'Kingston' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'Americas', subregion: 'Central America', capital: 'Mexico City' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', region: 'Americas', subregion: 'Central America', capital: 'Managua' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', region: 'Americas', subregion: 'Central America', capital: 'Panama City' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳', region: 'Americas', subregion: 'Caribbean', capital: 'Basseterre' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨', region: 'Americas', subregion: 'Caribbean', capital: 'Castries' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', region: 'Americas', subregion: 'Caribbean', capital: 'Kingstown' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', region: 'Americas', subregion: 'Caribbean', capital: 'Port of Spain' },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', subregion: 'Northern America', capital: 'Washington, D.C.' },

  // South America
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'Americas', subregion: 'South America', capital: 'Buenos Aires' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', region: 'Americas', subregion: 'South America', capital: 'Sucre' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Americas', subregion: 'South America', capital: 'Brasília' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'Americas', subregion: 'South America', capital: 'Santiago' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'Americas', subregion: 'South America', capital: 'Bogotá' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', region: 'Americas', subregion: 'South America', capital: 'Quito' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', region: 'Americas', subregion: 'South America', capital: 'Georgetown' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', region: 'Americas', subregion: 'South America', capital: 'Asunción' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', region: 'Americas', subregion: 'South America', capital: 'Lima' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', region: 'Americas', subregion: 'South America', capital: 'Paramaribo' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', region: 'Americas', subregion: 'South America', capital: 'Montevideo' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', region: 'Americas', subregion: 'South America', capital: 'Caracas' },

  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania', subregion: 'Australia and New Zealand', capital: 'Canberra' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', region: 'Oceania', subregion: 'Melanesia', capital: 'Suva' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮', region: 'Oceania', subregion: 'Micronesia', capital: 'Tarawa' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', region: 'Oceania', subregion: 'Micronesia', capital: 'Majuro' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲', region: 'Oceania', subregion: 'Micronesia', capital: 'Palikir' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷', region: 'Oceania', subregion: 'Micronesia', capital: 'Yaren' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania', subregion: 'Australia and New Zealand', capital: 'Wellington' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼', region: 'Oceania', subregion: 'Micronesia', capital: 'Ngerulmud' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', region: 'Oceania', subregion: 'Melanesia', capital: 'Port Moresby' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', region: 'Oceania', subregion: 'Polynesia', capital: 'Apia' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧', region: 'Oceania', subregion: 'Melanesia', capital: 'Honiara' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴', region: 'Oceania', subregion: 'Polynesia', capital: 'Nuku\'alofa' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', region: 'Oceania', subregion: 'Polynesia', capital: 'Funafuti' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', region: 'Oceania', subregion: 'Melanesia', capital: 'Port Vila' }
];

// Utility functions for country data
export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountriesByRegion = (region: string): Country[] => {
  return countries.filter(country => country.region === region);
};

export const getCountriesBySubregion = (subregion: string): Country[] => {
  return countries.filter(country => country.subregion === subregion);
};

export const searchCountries = (query: string): Country[] => {
  const lowercaseQuery = query.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(lowercaseQuery) ||
    country.code.toLowerCase().includes(lowercaseQuery) ||
    country.capital?.toLowerCase().includes(lowercaseQuery)
  );
};

export const sortCountries = (sortBy: 'name' | 'code' | 'region' = 'name'): Country[] => {
  return [...countries].sort((a, b) => {
    switch (sortBy) {
      case 'code':
        return a.code.localeCompare(b.code);
      case 'region':
        return a.region.localeCompare(b.region) || a.name.localeCompare(b.name);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
};

export const getRegions = (): string[] => {
  return [...new Set(countries.map(country => country.region))].sort();
};

export const getSubregions = (): string[] => {
  return [...new Set(countries.map(country => country.subregion))].sort();
};
