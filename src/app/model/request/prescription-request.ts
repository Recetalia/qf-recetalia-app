export interface PrescriptionRequest {
    expireAt?: string; // Expiration timestamp in ISO format
    medicId: string; // ID of the medic (required)
    patientId: string; // ID of the patient (required)
    code: string; // Prescription code (required)
    status: string; // Status of the prescription (e.g., "AVAILABLE") (required)
    dose?: number; // Amount of dose (optional)
    doseUnit?: string; // Unit of the dose (e.g., "mg") (optional)
    frecuency?: number; // Frequency of the dose (e.g., "3") (optional)
    frecuencyUnit?: string; // Frequency unit (e.g., "times per day") (optional)
    medicalHistory?: string; // Medical history details (optional)
    affections?: string; // Ailments or conditions (optional)
    duration?: number; // Duration of the treatment (e.g., "30") (optional)
    durationUnit?: string; // Duration unit (e.g., "days") (optional)
    productType: string; // Product type (e.g., "MEDICINE") (required)
    productId: string; // ID of the product (required)
    productName: string; // ID of the product (required)
    doseType?: string; // Type of dose (e.g., "tablet") (optional)
    isCronic?: boolean; // Indicates if the prescription is for a chronic condition (optional)
    dateTimeToSend?: string; // Date and time to send the prescription in ISO format (optional)
    dosificationType?: string;
}
