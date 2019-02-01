import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import * as yup from 'yup';
import Form from '../../../common/form/form';
import FormRow from '../../../common/form/form-row';
import FormPage from '../../../common/page/form-page';
import FormDateField from '../../../common/form/form-date-field';
import FormTextField from '../../../common/form/form-text-field';
import FormNumberField from '../../../common/form/form-number-field';
import { FieldArray } from 'formik';
import { DocumentNode } from 'graphql';
import Decimal from 'decimal.js';
import FormSelectField from '../../../common/form/form-select-field';

interface InvoiceViewModel {
    id?: string;
    issueDate: Date;
    dueDate: Date;
    client: string;
    items: InvoiceItemViewModel[];
}

interface InvoiceItemViewModel {
    text: string;
    unitCount: Decimal;
    unitPrice: Decimal;
}

interface ClientViewModel {
    id: string;
    name: string;
}

interface InvoiceFormProps {
    invoice: InvoiceViewModel;
    clients: ClientViewModel[];
    mutation: DocumentNode;
    successMessage: string;
    onSuccess?: (resp: any) => void;
    invalidateQueryCache?: boolean;
}

const validationSchema = yup.object().shape({
    issueDate: yup.date().required('issue date is required!'),
    dueDate: yup.date().required('due date is required!'),
    client: yup.string().required('client is required!'),
    items: yup.array().of(yup.object().shape({
        text: yup.string().required('text is required!'),
        unitPrice: yup.number().moreThan(0).required('unit price is required'),
        unitCount: yup.number().moreThan(0).required('unit count is required'),
    })).min(1, 'at least one item is required!').required()
})

class InvoiceForm extends Component<InvoiceFormProps> {

    private toFormValues(invoice: InvoiceViewModel) {
        return {
            ...invoice,
            items: invoice.items && invoice.items.map(item => ({
                ...item,
                unitPrice: item.unitPrice.toNumber(),
                unitCount: item.unitCount.toNumber()
            })) || []
        };
    }

    private fromFormValues(formValues: any): any {
        return {
            ...formValues,
            issueDate: formValues.issueDate.toISOString().substr(0, 10),
            dueDate: formValues.dueDate.toISOString().substr(0, 10),
            items: formValues.items.map((item: { unitPrice: number, unitCount: number }) => ({
                ...item,
                unitPrice: new Decimal(item.unitPrice),
                unitCount: new Decimal(item.unitCount)
            }))
        };
    }

    render() {
        return (
            <FormPage>
                <Form
                    initialValues={this.toFormValues(this.props.invoice)}
                    validationSchema={validationSchema}
                    submitText="Save"
                    formToModel={this.fromFormValues}
                    mutation={this.props.mutation}
                    successMessage={this.props.successMessage}
                    onSuccess={this.props.onSuccess}
                    invalidateQueryCache={this.props.invalidateQueryCache}
                >
                    {(formikProps: any) => (
                        <React.Fragment>
                            {/* component props: {JSON.stringify(this.props.invoice)}
                            <br></br>
                            formik props: {JSON.stringify(formikProps.values)} */}

                            <FormRow>
                                <div>Number: {formikProps.values.id}</div>
                            </FormRow>
                            <FormRow>
                                <FormSelectField name="client" label="Client" items={this.props.clients} itemValue="id" itemLabel="name" />
                            </FormRow>
                            <FormRow>
                                <FormDateField name="issueDate" label="Issue date" />
                            </FormRow>
                            <FormRow>
                                <FormDateField name="dueDate" label="Due date" />
                            </FormRow>

                            <FieldArray
                                name="items"
                                render={arrayHelpers => (
                                    <div>
                                        {formikProps.values.items.map((item: any, index: any) => (
                                            <FormRow key={index}>
                                                <FormTextField name={`items[${index}].text`} label="Text" />
                                                <FormNumberField name={`items[${index}].unitPrice`} label="Unit price" />
                                                <FormNumberField name={`items[${index}].unitCount`} label="Unit count" />
                                                <Button type="button" variant="contained" color="primary" onClick={() => arrayHelpers.remove(index)}>
                                                    remove
                                                </Button>
                                            </FormRow>
                                        ))}
                                        <Button type="button" variant="contained" color="primary" onClick={() => arrayHelpers.push({ text: '', unitPrice: '', unitCount: 1 })}>
                                            add
                                        </Button>
                                    </div>
                                )}
                            />
                        </React.Fragment>
                    )}
                </Form>
            </FormPage>
        );
    }
}

export default InvoiceForm;