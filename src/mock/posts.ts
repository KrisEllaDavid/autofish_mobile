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
}

export const mockPosts: Post[] = [
  {
    id: "1",
    producerName: "Pêcherie du Littoral",
    producerAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    postImage: "https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Arrivage frais du jour ! Nos poissons sont pêchés ce matin même. Venez découvrir notre sélection de bars, dorades et maquereaux à notre étal.",
    date: "2023-09-15T08:30:00Z",
    likes: 124,
    comments: 18,
    category: "Poisson",
    location: "Douala, Akwa"
  },
  {
    id: "2",
    producerName: "Ferme Bio Tropicale",
    producerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    postImage: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Nouvelles récoltes de légumes bio : tomates, aubergines, poivrons et courgettes. Cultivés sans pesticides dans notre ferme.",
    date: "2023-09-14T14:45:00Z",
    likes: 87,
    comments: 9,
    category: "Légumes",
    location: "Yaoundé, Tsinga"
  },
  {
    id: "3",
    producerName: "Boucherie Moderne",
    producerAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    postImage: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Viande de bœuf premium, élevage local en pâturage libre. Parfaite pour un bon grillage du weekend !",
    date: "2023-09-13T11:20:00Z",
    likes: 65,
    comments: 7,
    category: "Viande",
    location: "Douala, Bonapriso"
  },
  {
    id: "4",
    producerName: "Fromagerie du Village",
    producerAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    postImage: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=873&q=80",
    description: "Notre nouvelle création : fromage frais aux herbes du jardin. Parfait sur une bonne baguette ou en accompagnement de salades.",
    date: "2023-09-12T16:10:00Z",
    likes: 93,
    comments: 21,
    category: "Produits laitiers",
    location: "Yaoundé, Bastos"
  },
  {
    id: "5",
    producerName: "Plantation Kakao",
    producerAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    postImage: "https://images.unsplash.com/photo-1606913084603-3e7702b01627?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Fèves de cacao de qualité supérieure, récoltées à la main et séchées naturellement. Bientôt disponibles en tablettes de chocolat !",
    date: "2023-09-11T09:50:00Z",
    likes: 142,
    comments: 12,
    category: "Cacao",
    location: "Bafoussam"
  },
  {
    id: "6",
    producerName: "Fruits d'Eden",
    producerAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
    postImage: "https://images.unsplash.com/photo-1490474504059-bf2db5ab2348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Mangues, ananas et papayes fraîchement cueillis ! Profitez des saveurs tropicales pour vos desserts et smoothies.",
    date: "2023-09-10T13:30:00Z",
    likes: 110,
    comments: 14,
    category: "Fruits",
    location: "Limbé"
  },
  {
    id: "7",
    producerName: "Apiculture Naturelle",
    producerAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
    postImage: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
    description: "Miel toutes fleurs, récolte de printemps. Un délice sur vos tartines ou pour sucrer naturellement vos infusions !",
    date: "2023-09-09T10:15:00Z",
    likes: 78,
    comments: 8,
    category: "Miel",
    location: "Dschang"
  },
  {
    id: "8",
    producerName: "Volailles des Collines",
    producerAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
    postImage: "https://images.unsplash.com/photo-1569975455709-1a535a9656f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=773&q=80",
    description: "Œufs bio de poules élevées en plein air. Jaunes orangés et pleins de saveurs pour des omelettes gourmandes !",
    date: "2023-09-08T07:45:00Z",
    likes: 56,
    comments: 6,
    category: "Œufs",
    location: "Kribi"
  },
  {
    id: "9",
    producerName: "Le Moulin à Farine",
    producerAvatar: "https://randomuser.me/api/portraits/men/91.jpg",
    postImage: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=871&q=80",
    description: "Farine de blé complète, moulue à la pierre. Idéale pour vos pains et pâtisseries maison !",
    date: "2023-09-07T15:20:00Z",
    likes: 42,
    comments: 5,
    category: "Farines",
    location: "Douala, Bonamoussadi"
  },
  {
    id: "10",
    producerName: "Les Épices du Marché",
    producerAvatar: "https://randomuser.me/api/portraits/women/54.jpg",
    postImage: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Nouvelles épices fraîchement importées : curry, cumin, paprika et safran. Donnez du goût à vos plats !",
    date: "2023-09-06T12:10:00Z",
    likes: 89,
    comments: 11,
    category: "Épices",
    location: "Yaoundé, Nlongkak"
  },
  {
    id: "11",
    producerName: "Poissonnerie Maritime",
    producerAvatar: "https://randomuser.me/api/portraits/men/36.jpg",
    postImage: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Crevettes fraîches pêchées au large de nos côtes. Parfaites pour vos grillades ou plats en sauce !",
    date: "2023-09-05T08:50:00Z",
    likes: 117,
    comments: 19,
    category: "Fruits de mer",
    location: "Kribi, Port"
  },
  {
    id: "12",
    producerName: "Vignoble du Soleil",
    producerAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
    postImage: "https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    description: "Notre vin rouge cuvée spéciale est enfin disponible ! Élevé en fûts de chêne pendant 12 mois, notes de fruits rouges et d'épices.",
    date: "2023-09-04T17:30:00Z",
    likes: 135,
    comments: 23,
    category: "Vins",
    location: "Foumban"
  }
]; 