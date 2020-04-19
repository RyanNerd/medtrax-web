/**
 * Helper function that rehydrates the medicineList global state
 *
 * @param medicineProvider
 * @param residentId
 * @returns {Q.Promise<any> | Promise<T | never> | * | undefined}
 * @constructor
 */
export default function RefreshMedicineList(medicineProvider, residentId)
{
   const searchCriteria =
       {
           where: [
               {column: "ResidentId", value: residentId}
           ],
           order_by: [
               {column: "Drug", direction: "asc"}
           ]
       };

   return medicineProvider.search(searchCriteria)
       .then((response) => {
           if (response.success) {
               return response.data;
           } else {
               if (response.status === 404) {
                   return null;
               } else {
                   console.log('throw', response);
                   alert('throw');
                   throw response;
               }
           }
       })
       .catch((err) => {
           console.log('error', err);
           alert('problem');
           return err;
       });
}