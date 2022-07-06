using {arc.db as db} from '../db/data-model';














service CatalogService @(path : '/catalog')
@(requires: 'authenticated-user')
{
    entity Sales
      @(restrict: [{ grant: ['READ'],
                     to: 'Viewer'
                   },
                   { grant: ['WRITE'],
                     to: 'Admin' 
                   }
                  ])
      as select * from db.Sales
      actions {
        @(restrict: [{ to: 'Admin' }])
        action boost() returns Sales;
      }
    ;















    type userScopes { identified: Boolean; authenticated: Boolean; Viewer: Boolean; Admin: Boolean; };
    type userType { user: String; locale: String; scopes: userScopes; };
    function userInfo() returns userType;


};