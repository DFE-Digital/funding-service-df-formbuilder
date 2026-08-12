import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import sinon from 'sinon';
import { DSIAccess } from '../../../../../../src/server/plugins/engine/components';
import { DSIAccessComponent } from '@xgovformbuilder/model';
import { FormModel } from '../../../../../../src/server/plugins/engine/models';
import { FormData, FormSubmissionErrors } from '../../../../../../src/server/plugins/engine/types';
const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it, beforeEach } = lab;

suite('DSI Access Component', () => {

    describe('Generated schema', () => {
        let componentDefinition: DSIAccessComponent;
        let form: any;
        let formModel: FormModel;
        let component: any;

        beforeEach(async () => {
            componentDefinition = {
                subType: 'field',
                type: 'DSIAccess',
                name: 'qwerty',
                title: 'DSI data access',
                hint: 'hint',
                options: { required: false },
                schema: {}
            };

            form = {
                lastDownloaded: '2023/03/15 17:19',
                lastModified: '2023/03/15 17:19',
                id: 'qwerty',
                key: 'qwerty',
                displayName: 'Qwerty',
                pages: [],
                conditions: [],
                lists: [],
                sections: [],
                confirmationMsg: 'Yes?',
                fees: [],
                calculations: [],
                startPage: '/first-page'
            };

            formModel = new FormModel(form, {});
            await formModel.init();
            component = new DSIAccess(componentDefinition, formModel);
        });

        it('is not required by default', () => {
            if (!component) {
                return;
            }

            const flags = component.formSchema.describe().flags;
            if (!flags) {
                return;
            }

            //@ts-ignore
            expect(flags.presence).to.equal(
                'optional'
            );
        });

        it('sets orgUKPRN in value', () => {
            const result = component.getFormDataFromState({ orgUKPRN: '123456', progress: [], result: {} });
            expect(component.value).to.equal('123456');
            expect(result).to.be.undefined();
        });

        it('check getFormSchemaKeys schema', () => {
            const result = component.getFormSchemaKeys();
            expect(result.qwerty).not.to.be.empty();
            expect(result.qwerty.type).to.equal("string");
        });

        it('check getStateSchemaKeys schema', () => {
            const result = component.getStateSchemaKeys();
            expect(result.qwerty).not.to.be.empty();
            expect(result.qwerty.type).to.equal("string");
        });

        it('verify view model', () => {
            const formData: FormData = {
                lang: "en-US",
                orgUKPRN: '123456',
                progress: [],
                result: {}
            };
            const errors: FormSubmissionErrors = {
                titleText: "qwerty",
                errorList: []
            };
            // Set orgUKPRN in state so DSIAccess picks it up
            component.getFormDataFromState({ orgUKPRN: '123456', progress: [], result: {} });
            const result = component.getViewModel(formData, errors);
            expect(result).not.to.be.empty();
            expect(result.attributes.title).to.equal('DSI data access');
            expect(result.name).to.equal('qwerty');
            expect(result.value).to.equal('123456');
            expect(result?.hint?.html).to.equal('hint');
        });
    });
});
