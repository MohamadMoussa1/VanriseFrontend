export interface PhoneNumberReservation {
  id: number;
  client: string; // Readable Client name
  phoneNumber: string; // Readable Phone Number string
  bed: string; // Begin Effective Date
  eed: string | null; // End Effective Date (null = no end date)
}

export interface ActivePhoneNumberReservation {
  id: number;
  phoneNumberId: number;
  number: string;
}
