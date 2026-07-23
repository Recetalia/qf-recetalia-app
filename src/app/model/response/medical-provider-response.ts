export interface MedicalProviderResponse {
    id: string;
    medicalProviderTypeId: string;
    name: string;
    addressCountryId?: string;
    addressLocalityId?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComments?: string;
    phone: string;
    email: string;
    businessName: string;
    rut: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    logoId?: string;
    passwordForgotCode?: string;
    status: string;
}
