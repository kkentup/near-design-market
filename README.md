# near-design-market
# Developed by husband and wife

1. To run this project is easy, you need run the following commands
1.1 "npm install"
1.2 "npm start"

Then you can open http://localhost:3000/ to see the app.

2. Smart contract is in folder "contract"
To compile the contract, you need change your directory to "contract" first. Then run "yarn build" and "yarn build".
Some test cases are added in "contract/__test__/", you can run "yarn test" to verify if the smart contracts work as expected.

3. A little more about this project

4. Some NEAR commands for your reference
4.1 for deploying the smart contract
near create-account test.designmarket.testnet --masterAccount designmarket.testnet --initialBalance 10
near deploy --accountId test.designmarket.testnet --wasmFile build/market.wasm --initFunction init --initArgs '{"owner_id": "designmarket.testnet"}'

4.2 for reviewing the currenct states
near view test.designmarket.testnet get_owner '{}'
near view test.designmarket.testnet get_designs '{}'
near view test.designmarket.testnet get_reports '{}'
near view test.designmarket.testnet get_pool_amount '{}'
near view test.designmarket.testnet get_offers_by_object_id '{"object_id": "design_1"}'
near view test.designmarket.testnet get_reports_by_object_id '{"object_id": "design_1"}'

4.3 for adding a new design/offer/report
near call test.designmarket.testnet new_design '{"object_id": "design_1", "type": 1, "price": "100000000000000000000000", "image": "https://design.market/images/1", "deposit": "1000000000000000000000000" }' --accountId=client1.testnet --depositYocto=2000000000000000000000000
near call test.designmarket.testnet buy_design '{"object_id": "design_1"}' --depositYocto=100000000000000000000000 --accountId=client2.testnet
near call test.designmarket.testnet add_offer '{"object_id": "design_1"}' --depositYocto=1000000000000000000000000 --accountId=client3.testnet
