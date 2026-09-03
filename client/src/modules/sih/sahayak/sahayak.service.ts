export interface LocalSahayak {
  id: string;
  name: string;
  village: string;
  distanceKm: number;
  phone: string;
  rating: number;
  assignedFarmers: number;
}

export class SahayakService {
  /**
   * Fetches nearby human Sahayaks in the local village cluster
   */
  static getLocalSahayaks(): LocalSahayak[] {
    return [
      {
        id: 'sahayak-1',
        name: 'Gurpreet Singh',
        village: 'Khanna Block, Ludhiana',
        distanceKm: 1.8,
        phone: '+91 98765 43210',
        rating: 4.9,
        assignedFarmers: 42
      },
      {
        id: 'sahayak-2',
        name: 'Harminder Kaur',
        village: 'Samrala Block, Ludhiana',
        distanceKm: 3.2,
        phone: '+91 98765 43211',
        rating: 4.8,
        assignedFarmers: 38
      }
    ];
  }

  /**
   * Simulated WhatsApp Business API Interaction Bridge
   */
  static generateWhatsAppLink(userPhone: string = '', query: string = 'Hello Sahayak'): string {
    const encoded = encodeURIComponent(`BharatFarm AI Companion: ${query}`);
    return `https://wa.me/919876543210?text=${encoded}`;
  }
}
