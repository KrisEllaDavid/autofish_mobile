export interface Post {
  id: string;
  producerName: string;
  producerAvatar: string;
  postImage: string;
  description: string;
  date: string; // ISO string format
  likes: number;
  comments: number;
  category: string;
  location: string;
  price: number; // Price in FCFA
}

export const mockPosts: Post[] = [
    {
      "id": "1",
      "producerName": "Manioc du Sud",
      "producerAvatar": "https://randomuser.me/api/portraits/women/1.jpg",
      "postImage": "https://images.pexels.com/photos/8992765/pexels-photo-8992765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "description": "Bâtons de manioc frais et savoureux, produits localement sans pesticides. Idéal pour accompagner tous vos plats !",
      "date": "2024-10-26T10:00:00Z",
      "likes": 120,
      "comments": 15,
      "category": "Manioc",
      "location": "Sangmélima, Sud",
      "price": 1000
    },
    {
      "id": "2",
      "producerName": "Poissonnerie du Wouri",
      "producerAvatar": "https://randomuser.me/api/portraits/men/2.jpg",
      "postImage": "https://deklic.eco/wp-content/uploads/2023/08/Caisse-poissons.jpg",
      "description": "Poisson frais (Tilapia) pêché durablement dans le fleuve Wouri. Qualité et fraîcheur garanties.",
      "date": "2024-10-25T14:30:00Z",
      "likes": 250,
      "comments": 32,
      "category": "Poisson",
      "location": "Douala, Yassa",
      "price": 3500
    },
    {
      "id": "3",
      "producerName": "Ferme Avicole de l'Ouest",
      "producerAvatar": "https://randomuser.me/api/portraits/men/3.jpg",
      "postImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpGa8tDaOOcRDAgrL1RCrmwnV2BQKRvSiplg&s",
      "description": "Poulets de chair élevés en plein air, nourris aux grains naturels. Une volaille tendre et juteuse.",
      "date": "2024-10-24T09:00:00Z",
      "likes": 180,
      "comments": 25,
      "category": "Volaille",
      "location": "Bafoussam, Ouest",
      "price": 5000
    },
      {
      "id": "4",
      "producerName": "Les Plantains du Moungo",
      "producerAvatar": "https://randomuser.me/api/portraits/women/4.jpg",
      "postImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW-yqLUFfH4IQab7ERJDiE6dc9jcA41izUpz_EoW67VEAQYfpHf_rPjpkGjKDRnX2HtV8&usqp=CAU",
      "description": "Régimes de plantain mûrs et sucrés, parfaits pour vos pilés et malaxés. Récoltés avec soin.",
      "date": "2024-10-23T12:00:00Z",
      "likes": 210,
      "comments": 28,
      "category": "Plantain",
      "location": "Nkongsamba, Littoral",
      "price": 2500
    },
    {
      "id": "5",
      "producerName": "Ignames du Nord-Ouest",
      "producerAvatar": "https://randomuser.me/api/portraits/men/5.jpg",
      "postImage": "https://www.maceo-groupe.fr/wp-content/uploads/2023/07/TAS_IGNAMES-800x800.jpg",
      "description": "Grosses ignames blanches, idéales pour la bouillie ou les frites. Culture traditionnelle et bio.",
      "date": "2024-10-22T16:45:00Z",
      "likes": 95,
      "comments": 12,
      "category": "Igname",
      "location": "Bamenda, Nord-Ouest",
      "price": 4000
    },
    {
      "id": "6",
      "producerName": "Riz de Yagoua",
      "producerAvatar": "https://randomuser.me/api/portraits/women/6.jpg",
      "postImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrVmHqV2FLXrkcZv9KCtiuaGDoiFd46VY1Jw&s",
      "description": "Riz blanc de qualité supérieure, cultivé dans les plaines de Yagoua. Ne colle pas à la cuisson.",
      "date": "2024-10-21T08:15:00Z",
      "likes": 320,
      "comments": 45,
      "category": "Riz",
      "location": "Yagoua, Extrême-Nord",
      "price": 15000
    },
    {
      "id": "7",
      "producerName": "Arachides du Centre",
      "producerAvatar": "https://randomuser.me/api/portraits/men/7.jpg",
      "postImage": "https://image.tuasaude.com/media/article/wg/xp/beneficios-do-amendoim_17802.jpg?width=686&height=487",
      "description": "Sacs d'arachides fraîches, parfaites pour vos grillades ou pour faire du beurre d'arachide maison.",
      "date": "2024-10-20T18:00:00Z",
      "likes": 88,
      "comments": 10,
      "category": "Arachide",
      "location": "Yaoundé, Centre",
      "price": 7500
    },
    {
      "id": "8",
      "producerName": "Piments de Penja",
      "producerAvatar": "https://randomuser.me/api/portraits/women/8.jpg",
      "postImage": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQZ486lrbWVskNA8qHQLe6gUwUuTGYaCW4W68VBzH8fuu3XNRXhrUh8KNOl-lvuDqWDTB3ssEN2zuZHvhQXVagCa4nXVrQRnd-hco2XbmI",
      "description": "Piment jaune piquant et parfumé. Idéal pour relever tous vos plats et sauces.",
      "date": "2024-10-19T11:30:00Z",
      "likes": 150,
      "comments": 22,
      "category": "Piment",
      "location": "Penja, Littoral",
      "price": 2000
    },
    {
      "id": "9",
      "producerName": "Le Gombo Vert",
      "producerAvatar": "https://randomuser.me/api/portraits/men/9.jpg",
      "postImage": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtBRYqD3xW4EMXhFFLKYi-ds3kEkPA9ASGEg&s",
      "description": "Gombo frais et croquant, cueilli du jour. Pour une sauce gombo gluante et délicieuse.",
      "date": "2024-10-18T13:00:00Z",
      "likes": 110,
      "comments": 18,
      "category": "Gombo",
      "location": "Kribi, Sud",
      "price": 1500
    },
    {
      "id": "10",
      "producerName": "Huilerie de la Dibamba",
      "producerAvatar": "https://randomuser.me/api/portraits/women/10.jpg",
      "postImage": "https://images.pexels.com/photos/6795322/pexels-photo-6795322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "description": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Palm_Oils_-_outer_pulp_vs_kernel_from_African_Oil_Palm_-_Elaeis_guineenisis.jpg/640px-Palm_Oils_-_outer_pulp_vs_kernel_from_African_Oil_Palm_-_Elaeis_guineenisis.jpg",
      "date": "2024-10-17T15:20:00Z",
      "likes": 400,
      "comments": 55,
      "category": "Huile de Palme",
      "location": "Edéa, Littoral",
      "price": 12000
    }
]; 