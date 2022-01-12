public  inherited sharing  class SeachClass {
    @AuraEnabled(Cacheable = true)
    public static list<Account> retriveAccs(String strAccName) {
        strAccName = '%' + strAccName + '%';
        list<Account> lstAccs = [SELECT  Id, Name, Industry, Phone, Type From Account WHERE Name LIKE :strAccName];
        System.debug('lstAccslstAccslstAccs+'+lstAccs);
        if(lstAccs.isEmpty()) {
            throw new AuraHandledException('No Record Found..');
        }
        return lstAccs; 
    }
    
    
    @AuraEnabled(Cacheable = true)
    public static list<wrap> findDupesApex(String accName) {
        Account acc = (Account) System.JSON.deserialize(accName, Account.class);
        acc.Industry = 'Retail';
        
        List<Account> acctList = new List<Account>();
        
        acctList.add(acc); 
        List<wrap> wrapList = new List<wrap>();
        Datacloud.FindDuplicatesResult[] results = Datacloud.FindDuplicates.findDuplicates(acctList);
        System.debug('============results'+results);
        for (Datacloud.FindDuplicatesResult findDupeResult : results) {
            System.debug('============findDupeResult'+findDupeResult);
            for (Datacloud.DuplicateResult dupeResult : findDupeResult.getDuplicateResults()) {
                System.debug('============dupeResult'+dupeResult);
                
                //return dupeResult.getMatchResults();
                for (Datacloud.MatchResult matchResult : dupeResult.getMatchResults()) {
                    
                    System.debug('============matchResult'+matchResult);
                    
                    //return matchResult;
                    for (Datacloud.MatchRecord matchRecord : matchResult.getMatchRecords()) {
                        wrap wpItem = new wrap();
                        for(Datacloud.FieldDiff fieldDiff : matchRecord.getFieldDiffs()){
                        Differnce dif = new Differnce();
                        dif.fName = fieldDiff.getName();
                        dif.Status = fieldDiff.getDifference();
                        wpItem.DiffList.add(dif);
                        }
                        System.debug('============matchRecord'+matchRecord);
                        System.debug('Duplicate Record: ' + matchRecord.getRecord());
                        
                        wpItem.duplicateAcc = (Account) matchRecord.getRecord();
                    wrapList.add(wpItem);
                    }
                    
                }
            }
        }
        
        System.debug('============='+wrapList);
        return wrapList; 
    }
    
    
    @AuraEnabled(cacheable=true)
  public static List<Account> getAccounts() {
  return [SELECT Id, Name, Phone FROM Account];
  }
    
    public class wrap{
        //{Name: '11111', Website: '22222', Phone: '333333'}
        @AuraEnabled
        public List<Differnce> DiffList = new List<Differnce>();
        @AuraEnabled
        public Account duplicateAcc = new Account();
    }
    
    public class Differnce{
        @AuraEnabled
        public string fName;
        @AuraEnabled
        public string Status;
        }
    
    
    
}