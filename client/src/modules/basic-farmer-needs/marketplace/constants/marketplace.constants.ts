export const MARKETPLACE_CONSTANTS = {
  CATEGORIES: ['all', 'crops', 'seeds', 'fertilizers', 'equipment'],
  UNITS: ['kg', 'quintal', 'ton', 'bag', 'piece', 'crate', 'dozen', 'litre', 'acre'],
  CROPS: [
    // Cereals & Millets
    'Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar', 'Ragi', 'Barley', 'Oats',
    'Foxtail Millet', 'Barnyard Millet', 'Kodo Millet', 'Little Millet', 'Proso Millet',
    'Amaranth', 'Buckwheat', 'Quinoa',
    // Pulses & Legumes
    'Gram', 'Chana', 'Arhar', 'Toor Dal', 'Moong', 'Urad', 'Masoor', 'Rajma',
    'Soybean', 'Peas', 'Cowpea', 'Lobia', 'Horse Gram', 'Kulthi', 'Moth Bean',
    // Oilseeds
    'Groundnut', 'Mustard', 'Sesame', 'Sunflower', 'Safflower', 'Castor',
    'Linseed', 'Niger Seed',
    // Cash Crops
    'Cotton', 'Sugarcane', 'Jute', 'Tea', 'Coffee', 'Rubber', 'Tobacco',
    // Vegetables
    'Potato', 'Onion', 'Tomato', 'Brinjal', 'Cabbage', 'Cauliflower',
    'Okra', 'Carrot', 'Radish', 'Beans', 'Chilli', 'Capsicum',
    'Spinach', 'Palak', 'Fenugreek', 'Methi', 'Bitter Gourd', 'Bottle Gourd',
    'Ridge Gourd', 'Snake Gourd', 'Ash Gourd', 'Pumpkin', 'Cucumber',
    'Sweet Potato', 'Yam', 'Taro', 'Beetroot', 'Turnip', 'Drumstick',
    'Moringa', 'Pointed Gourd', 'Parwal', 'Ivy Gourd', 'Cluster Beans',
    'Green Beans', 'Lettuce', 'Broccoli', 'Mushroom',
    // Spices & Condiments
    'Turmeric', 'Ginger', 'Garlic', 'Coriander', 'Cumin', 'Black Pepper',
    'Cardamom', 'Clove', 'Cinnamon', 'Nutmeg', 'Star Anise', 'Fennel',
    'Ajwain', 'Bay Leaf', 'Saffron', 'Vanilla', 'Curry Leaves', 'Tamarind',
    // Fruits
    'Banana', 'Mango', 'Apple', 'Orange', 'Grapes', 'Guava', 'Papaya',
    'Pomegranate', 'Coconut', 'Pineapple', 'Watermelon', 'Muskmelon',
    'Jackfruit', 'Lychee', 'Sapota', 'Chiku', 'Custard Apple', 'Fig',
    'Date', 'Passion Fruit', 'Dragon Fruit', 'Kiwi', 'Strawberry',
    'Jamun', 'Amla', 'Bael', 'Ber', 'Falsa', 'Lemon', 'Lime',
    'Sweet Lime', 'Mosambi', 'Plum', 'Peach', 'Apricot', 'Cherry', 'Pear',
    'Avocado', 'Starfruit',
    // Nuts
    'Cashew', 'Almond', 'Walnut', 'Pistachio', 'Arecanut',
    // Flowers
    'Marigold', 'Rose', 'Jasmine', 'Chrysanthemum', 'Tuberose', 'Gladiolus',
    // Others
    'Aloe Vera', 'Tulsi', 'Lemongrass', 'Neem', 'Bamboo'
  ],
  STATES: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ],
  DISTRICTS_BY_STATE: {
    'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
    'Arunachal Pradesh': ['Anjaw', 'Changlang', 'East Kameng', 'East Siang', 'Lohit', 'Lower Subansiri', 'Papum Pare', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
    Assam: ['Baksa', 'Barpeta', 'Cachar', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Goalpara', 'Golaghat', 'Jorhat', 'Kamrup', 'Karimganj', 'Lakhimpur', 'Nagaon', 'Sivasagar', 'Sonitpur', 'Tinsukia'],
    Bihar: ['Araria', 'Aurangabad', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Darbhanga', 'Gaya', 'Katihar', 'Madhubani', 'Muzaffarpur', 'Nalanda', 'Patna', 'Purnia', 'Samastipur', 'Saran', 'Vaishali'],
    Chhattisgarh: ['Balod', 'Baloda Bazar', 'Bastar', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Janjgir-Champa', 'Korba', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Surguja'],
    Goa: ['North Goa', 'South Goa'],
    Gujarat: ['Ahmedabad', 'Amreli', 'Anand', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Dahod', 'Gandhinagar', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mehsana', 'Rajkot', 'Surat', 'Vadodara', 'Valsad'],
    Haryana: ['Ambala', 'Bhiwani', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
    'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
    Jharkhand: ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Palamu', 'Ranchi', 'West Singhbhum'],
    Karnataka: ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chikkamagaluru', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Hassan', 'Kalaburagi', 'Mandya', 'Mysuru', 'Raichur', 'Shivamogga', 'Tumakuru', 'Udupi', 'Vijayapura'],
    Kerala: ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
    'Madhya Pradesh': ['Balaghat', 'Bhopal', 'Chhindwara', 'Dewas', 'Guna', 'Gwalior', 'Hoshangabad', 'Indore', 'Jabalpur', 'Khandwa', 'Mandla', 'Morena', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Ujjain', 'Vidisha'],
    Maharashtra: ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Jalgaon', 'Kolhapur', 'Latur', 'Nagpur', 'Nanded', 'Nashik', 'Pune', 'Raigad', 'Sangli', 'Satara', 'Solapur', 'Thane', 'Wardha', 'Yavatmal'],
    Manipur: ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Senapati', 'Tamenglong', 'Thoubal', 'Ukhrul'],
    Meghalaya: ['East Garo Hills', 'East Khasi Hills', 'Jaintia Hills', 'Ri Bhoi', 'South Garo Hills', 'West Garo Hills', 'West Khasi Hills'],
    Mizoram: ['Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Serchhip'],
    Nagaland: ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
    Odisha: ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Cuttack', 'Dhenkanal', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Kalahandi', 'Kendrapara', 'Keonjhar', 'Koraput', 'Mayurbhanj', 'Puri', 'Sambalpur', 'Sundargarh'],
    Punjab: ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Patiala', 'Rupnagar', 'Sangrur'],
    Rajasthan: ['Ajmer', 'Alwar', 'Banswara', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Chittorgarh', 'Churu', 'Dausa', 'Ganganagar', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jodhpur', 'Kota', 'Nagaur', 'Pali', 'Sikar', 'Udaipur'],
    Sikkim: ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
    'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kancheepuram', 'Kanniyakumari', 'Madurai', 'Nagapattinam', 'Salem', 'Thanjavur', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Villupuram'],
    Telangana: ['Adilabad', 'Hyderabad', 'Jagtial', 'Karimnagar', 'Khammam', 'Mahabubnagar', 'Medak', 'Nalgonda', 'Nizamabad', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Warangal'],
    Tripura: ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
    'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Azamgarh', 'Bareilly', 'Basti', 'Bulandshahr', 'Deoria', 'Etawah', 'Faizabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Gorakhpur', 'Hardoi', 'Jaunpur', 'Jhansi', 'Kanpur Nagar', 'Lucknow', 'Mathura', 'Meerut', 'Moradabad', 'Muzaffarnagar', 'Prayagraj', 'Raebareli', 'Saharanpur', 'Sitapur', 'Varanasi'],
    Uttarakhand: ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
    'West Bengal': ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'],
    'Andaman and Nicobar Islands': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
    Chandigarh: ['Chandigarh'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
    Delhi: ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Jammu and Kashmir': ['Anantnag', 'Baramulla', 'Budgam', 'Doda', 'Jammu', 'Kathua', 'Kishtwar', 'Kupwara', 'Pulwama', 'Rajouri', 'Samba', 'Srinagar', 'Udhampur'],
    Ladakh: ['Kargil', 'Leh'],
    Lakshadweep: ['Lakshadweep'],
    Puducherry: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam']
  } as Record<string, string[]>
};
