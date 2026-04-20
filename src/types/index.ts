export interface User {
    id: string;
    email: string;
    name: string;
    role: 'adopter' | 'shelter';
    phone?: string;
    avatar_url?: string;
    is_active?: boolean;
}

export interface Pet {
    id: string;
    shelter_id: string;
    name: string;
    species: string;
    breed?: string;
    age: number;
    gender: 'male' | 'female' | 'unknown';
    weight?: string;
    color?: string;
    health_status?: string;
    vaccination_status?: boolean;
    neutered?: boolean;
    description?: string;
    photos?: string[];
    status: 'available' | 'pending' | 'adopted' | 'unavailable';
    created_at?: string;
    updated_at?: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    pet_id?: string;
    is_read?: boolean;
}