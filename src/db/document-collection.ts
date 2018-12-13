import micromatch from 'micromatch';
import { IQuery } from "./query";
import { IDocumentFs } from './document-fs';
import sift from 'sift';

export class DocumentCollection<T> {
    constructor(private name: string, private fsReader: IDocumentFs) {
    }

    async getAll<T>(query?: IQuery<T>) {
        let collection = await this.fsReader.getCollection(this.name);
        if (query && query.id) {
            collection = collection.filter(d => micromatch.isMatch(d, query.id!!));
        }

        let docs = await Promise.all(collection.map(doc => this.fsReader.getDocument(this.name, doc)));

        if (query && query.where) {
            docs = sift(query.where, docs);
        }

        return docs;
    }
}