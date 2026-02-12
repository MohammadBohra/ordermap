using { ro.dtc.bigcomm as bigcomm } from '../db/schema';

service BigCommStoreService @(path: '/catalog') {
    //@readonly @restrict: [{ to: 'BigCommStoresDisplay' }, { to: 'BigCommStoresAdmin' }]
    @odata.draft.enabled
    //entity Stores as projection on bigcomm.Stores;
    entity Stores as projection on bigcomm.Stores {*};


  @cds.persistence.skip
  @odata.singleton
  entity FeatureControl {
    operationHidden : Boolean;
  }


}

annotate BigCommStoreService.Stores with @(
  UI.CreateHidden: { $edmJson: { $Path: '/BigCommStoreService.EntityContainer/FeatureControl/operationHidden' } },
  UI.UpdateHidden: { $edmJson: { $Path: '/BigCommStoreService.EntityContainer/FeatureControl/operationHidden' } },
  UI.DeleteHidden: { $edmJson: { $Path: '/BigCommStoreService.EntityContainer/FeatureControl/operationHidden' } }
);

