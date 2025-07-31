/**
 * Client entity defines the shape of client objects stored by the
 * application.  In a production system this would be represented by
 * a database model.
 */
export class Client {
  id!: number;
  name!: string;
  email!: string;
  address?: string;
  defaultPaymentTerms?: string;
}