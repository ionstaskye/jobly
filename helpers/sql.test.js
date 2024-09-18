/** Tests for sql for partial update function */
const {sqlForPartialUpdate} = require('./sql')

describe('sqlForPartialUpdate', function(){
    test('Outputs proper data',function(){
        update = sqlForPartialUpdate("Jim", {firstName: "Parker", lastName:"Test"})

        expect (update).toEqual(
            {setCols :['"firstName" = 1$', '"lastName" = 2$'],
            values: ['Parker', 'Test'] }
        )
    })
    test('errorWhenNoDataPassed', function(){
        try{
            update = sqlForPartialUpdate("Jim", {})}
        catch(e){
            expect(err instanceof BadRequestError).toBeTruthy();
        }

    })
})