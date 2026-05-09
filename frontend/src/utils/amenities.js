import {
  Wifi,
  Wind,
  Zap,
  Shield,
  Droplets,
  Car,
  Mountain,
  Waves,
  Sun,
  Sparkles,
  GlassWater,
  Monitor,
  Network,
  Plug,
  Users,
  Utensils,
  Shirt,
  Home,
  Dog,
  Lock,
  PlusSquare,
  Flame,
  Bluetooth,
} from 'lucide-react';

export const AMENITY_CATEGORIES = [
  {
    id: 'essentials',
    label: 'The Must-Haves',
    description: 'Essential for every stay',
    amenities: [
      { id: 'wifi', label: 'Free High-Speed Wi-Fi', icon: Wifi },
      { id: 'ac', label: 'Air Conditioning', icon: Wind },
      { id: 'power', label: 'Power Backup / Generator', icon: Zap },
      { id: 'security', label: '24hr Security / CCTV', icon: Shield },
      { id: 'water', label: 'Hot Water / Geyser', icon: Droplets },
      { id: 'parking', label: 'Free Parking', icon: Car },
    ],
  },
  {
    id: 'varkala',
    label: 'Varkala Signature',
    description: 'Local specialties and views',
    amenities: [
      { id: 'view', label: 'Cliff / Sea View', icon: Mountain },
      { id: 'beach', label: 'Beach Access', icon: Waves },
      { id: 'yoga', label: 'Yoga Deck / Meditation Space', icon: Sun },
      { id: 'spa', label: 'Ayurvedic Spa / Wellness Center', icon: Sparkles },
      { id: 'nets', label: 'Mosquito Nets', icon: Shield },
      { id: 'filtered_water', label: 'Filtered Drinking Water', icon: GlassWater },
    ],
  },
  {
    id: 'nomad',
    label: 'Digital Nomad Kit',
    description: 'Everything for remote work',
    amenities: [
      { id: 'workspace', label: 'Dedicated Workspace', icon: Monitor },
      { id: 'ethernet', label: 'Ethernet Port', icon: Network },
      { id: 'power_strips', label: 'Power Strips / Multi-sockets', icon: Plug },
      { id: 'coworking', label: 'Common Coworking Lounge', icon: Users },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Convenience & Lifestyle',
    description: 'Daily comfort and services',
    amenities: [
      { id: 'breakfast', label: 'Breakfast Included', icon: Utensils },
      { id: 'kitchen', label: 'Kitchen Access', icon: Utensils },
      { id: 'laundry', label: 'Laundry Service', icon: Shirt },
      { id: 'housekeeping', label: 'Daily Housekeeping', icon: Home },
      { id: 'pet', label: 'Pet-Friendly', icon: Dog },
      { id: 'ev', label: 'EV Charging Point', icon: Zap },
    ],
  },
  {
    id: 'safety',
    label: 'Safety & Tech',
    description: 'Modern standards',
    amenities: [
      { id: 'smartlock', label: 'Smart Lock / Self Check-in', icon: Lock },
      { id: 'firstaid', label: 'First Aid Kit', icon: PlusSquare },
      { id: 'fire', label: 'Fire Extinguisher', icon: Flame },
      { id: 'media', label: 'Bluetooth Audio / Smart TV', icon: Bluetooth },
    ],
  },
];

export const ALL_AMENITIES = AMENITY_CATEGORIES.flatMap((c) => c.amenities);

export const getAmenityByLabel = (label) => ALL_AMENITIES.find((a) => a.label === label);
