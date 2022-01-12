import { LightningElement, track } from "lwc";

    import { ShowToastEvent } from "lightning/platformShowToastEvent";
    import { createRecord } from "lightning/uiRecordApi";
    import serachAccs from '@salesforce/apex/SeachClass.findDupesApex';
    import { NavigationMixin } from 'lightning/navigation';

    
    import ACCOUNT_OBJECT from "@salesforce/schema/Account";
    
    const columns = [
        { label: 'Field', fieldName: 'fName' },
        { label: 'Status', fieldName: 'Status' }
    ];
    export default class CreateNewAccount extends NavigationMixin(LightningElement) {
        
        accountRecord = {};
        isLoading = false;
        @track strSearchAccName = '';
        @track accountList =[];
    
        handleChange(event) {
            this.accountRecord[event.target.name] = event.target.value;
            this.strSearchAccName = event.detail.value;
        }
    
        handleClick(event){
            console.log(event.target.value);
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: event.target.value,
                    objectApiName: 'Account',
                    actionName: 'view',
                },
            });
        }
        createAccount() {
            this.isLoading = true;
            const fields = this.accountRecord;
    
            const recordInput = { apiName: ACCOUNT_OBJECT.objectApiName, fields };
    
            
                if(!this.strSearchAccName) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: "Success",
                            message: "Search String null!",
                            variant: "success"
                        })
                    );
                }else{



        
                serachAccs({accName : JSON.stringify(this.accountRecord)})
                .then(result => {
                    
        
                    this.accountList = result;
                    this.isLoading = false;


                    if(this.accountList.length <1){
                        createRecord(recordInput)
                            .then((account) => {
                                this.accountId = account.id;
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: "Success",
                                        message: "Account created successfully!",
                                        variant: "success"
                                    })
                                );

                                this[NavigationMixin.Navigate]({
                                    type: 'standard__recordPage',
                                    attributes: {
                                        recordId: this.accountId ,
                                        objectApiName: 'Account',
                                        actionName: 'view',
                                    },
                                });
                
                                this.accountRecord = {};
                            })
                            .catch((error) => {
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: "Error creating record",
                                        message: 'Error',
                                        variant: "error"
                                    })
                                );
                            })
                            .finally(() => {
                                this.isLoading = false;
                            });
                        }else{
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: "Found Duplicate",
                                    message: 'Error',
                                    variant: "error"
                                })
                            );
                        }




                    
                })
                .catch(error => {
                    this.searchData = undefined;
                    window.console.log('error =====> '+JSON.stringify(error));
                    if(error) {
                        this.errorMsg = error.body.message;
                    }
                }) 
            
        }



    }
    }