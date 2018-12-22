import { InvoiceDocument, InvoiceItem as InvoiceItemDoc } from './invoice-document';
import { db } from '../db';
import { Invoice, InvoiceItem } from "./invoice";
import { max, padStart } from 'lodash';

class InvoiceService {
    getAll(): Promise<InvoiceDocument[]> {
        return db.invoices.getAll();
    }
    getById(id: string): Promise<InvoiceDocument> {
        return db.invoices.single(id);
    }
    async create(invoice: InvoiceCreateModel): Promise<InvoiceDocument> {
        const number = await this.getNextNumberInYear(invoice.issueDate.getFullYear());
        const invoiceDocument = {
            ...invoice,
            id: number,
            number,
        };
        return db.invoices.create(invoiceDocument);
    }
    async update(invoice: InvoiceUpdateModel): Promise<InvoiceDocument> {
        let invoiceDocument = await db.invoices.single(invoice.id);
        invoiceDocument = { ...invoiceDocument, ...invoice };
        return db.invoices.update(invoiceDocument);
    }
    
    async getNextNumberInYear(year: number): Promise<string> {
        const idsInYear = await db.invoices.getAllIds({ id: `${year}*` });
        if (!idsInYear.length) {
            return `${year}001`;
        }
        const invoiceNumbers = idsInYear.map(id => parseInt(id.substring(4)));
        return year + padStart(((max(invoiceNumbers) || 0) + 1).toString(), 3, '0');
    }

}

export const invoiceService = new InvoiceService();

interface InvoiceCreateModel {
    issueDate: Date,
    dueDate: Date,
    client: string,
    items: InvoiceItemDoc[]
}

interface InvoiceUpdateModel {
    id: string,
    issueDate: Date,
    dueDate: Date,
    client: string,
    items: InvoiceItemDoc[]
}