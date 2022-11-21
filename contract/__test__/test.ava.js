import { NEAR, Worker } from 'near-workspaces';
import test from 'ava';

const ONE_NEAR = "1000000000000000000000000";

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etc.
    const root = worker.rootAccount;

    // Create market account for contract deployment
    const market = await root.createSubAccount("market");

    // Deploy the design market contract.
    await market.deploy("./build/market.wasm");

    // Initialize the design market contract
    await root.call(market, "init", {owner_id: root.accountId});

    // Test users
    const ali = await root.createSubAccount("ali", {initialBalance: NEAR.parse('10 N').toJSON()});
    const bob = await root.createSubAccount("bob", {initialBalance: NEAR.parse('10 N').toJSON()});
    const cha = await root.createSubAccount("cha", {initialBalance: NEAR.parse('10 N').toJSON()});

    // Save state for test runs
    t.context.worker = worker;
    t.context.accounts = { root, market, ali, bob, cha};
});

// If the environment is reused, use test.after to replace test.afterEach
test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test("design market init test", async t => {
    const { root, market } = t.context.accounts;
    const designs = await market.view("get_designs", {});
    t.deepEqual(designs, []);

    const owner = await market.view("get_owner", {});
    t.is(owner, root.accountId);

    const pool = await market.view("get_pool_amount", {});
    t.is(pool, "0");

    const repors = await market.view("get_reports", {});
    t.deepEqual(designs, []);
});

test("add a new design object works", async t => {
    const { market, ali } = t.context.accounts;
    let attachedDeposit = "2 N";
    await ali.call(market, "new_design", {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", deposit: ONE_NEAR}, {attachedDeposit});
    await ali.call(market, "new_design", {object_id: "design_2", type: 2, price: "10000000000000000", image: "image_link_2", deposit: ONE_NEAR}, {attachedDeposit});

    const designs = await market.view('get_designs', {});
    t.deepEqual(designs[0][1], {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", offers: {}, on_sale: true, orig_owner: ali.accountId, owner: ali.accountId, copyright_deposit: ONE_NEAR, reports: 0, timeStamp: designs[0][1].timeStamp});
    t.deepEqual(designs[1][1], {object_id: "design_2", type: 2, price: "10000000000000000", image: "image_link_2", offers: {}, on_sale: true, orig_owner: ali.accountId, owner: ali.accountId, copyright_deposit: ONE_NEAR, reports: 0, timeStamp: designs[1][1].timeStamp});
});

test("buy a design object works", async t => {
    const { market, ali, bob } = t.context.accounts;
    let attachedDeposit = "2 N";
    await ali.call(market, "new_design", {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", deposit: ONE_NEAR}, {attachedDeposit});

    let designs = await market.view('get_designs', {});
    t.deepEqual(designs[0][1], {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", offers: {}, on_sale: true, orig_owner: ali.accountId, owner: ali.accountId, copyright_deposit: ONE_NEAR, reports: 0, timeStamp: designs[0][1].timeStamp});

    await bob.call(market, "buy_design", {object_id: "design_1"}, {attachedDeposit});

    designs = await market.view('get_designs', {});
    t.deepEqual(designs[0][1], {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", offers: {}, on_sale: false, orig_owner: ali.accountId, owner: bob.accountId, copyright_deposit: ONE_NEAR, reports: 0, timeStamp: designs[0][1].timeStamp});
});

test("add a new offer works", async t => {
    const { market, ali, bob } = t.context.accounts;
    let offer = "1000000000000000000000000";
    let attachedDeposit = "2 N";
    await ali.call(market, "new_design", {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", deposit: ONE_NEAR}, {attachedDeposit});

    let designs = await market.view('get_designs', {});
    t.deepEqual(designs[0][1], {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", offers: {}, on_sale: true, orig_owner: ali.accountId, owner: ali.accountId, copyright_deposit: ONE_NEAR, reports: 0, timeStamp: designs[0][1].timeStamp});

    await bob.call(market, "add_offer", {object_id: "design_1", offer}, {attachedDeposit});

    designs = await market.view('get_designs', {});
    let cur_offers = {};
    cur_offers[bob.accountId] = offer;
    t.deepEqual(designs[0][1], {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", offers: cur_offers, on_sale: true, orig_owner: ali.accountId, owner: ali.accountId, copyright_deposit: ONE_NEAR, reports: 0, timeStamp: designs[0][1].timeStamp});
    
    const offers = await market.view('get_offers_by_object_id', {object_id: "design_1"});
    t.deepEqual(offers, [{accountId: bob.accountId, offer}]);
});

test("add a new report works", async t => {
    const { root, market, ali, bob } = t.context.accounts;
    let attachedDeposit = "2 N";
    await ali.call(market, "new_design", {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", deposit: ONE_NEAR}, {attachedDeposit});

    let designs = await market.view('get_designs', {});
    t.deepEqual(designs[0][1], {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", offers: {}, on_sale: true, orig_owner: ali.accountId, owner: ali.accountId, copyright_deposit: ONE_NEAR, reports: 0, timeStamp: designs[0][1].timeStamp});

    await bob.call(market, "new_report", {object_id: "design_1", report_url: "report_1", deposit: ONE_NEAR}, {attachedDeposit});

    designs = await market.view('get_designs', {});
    t.deepEqual(designs[0][1], {object_id: "design_1", type: 1, price: "10000000000000000", image: "image_link_1", offers: {}, on_sale: true, orig_owner: ali.accountId, owner: ali.accountId, copyright_deposit: ONE_NEAR, reports: 1, timeStamp: designs[0][1].timeStamp});

    let reports = await market.view("get_reports", {});
    t.deepEqual(reports[0][1], {object_id: "design_1", reporter: bob.accountId, report: "report_1", report_id: 0, approved: false, proof: "", deposit: ONE_NEAR, timeStamp: reports[0][1].timeStamp});
    
    reports = await market.view('get_reports_by_object_id', {object_id: "design_1"});
    t.deepEqual(reports[0], {object_id: "design_1", reporter: bob.accountId, report: "report_1", report_id: 0, approved: false, proof: "", deposit: ONE_NEAR, timeStamp: reports[0].timeStamp});

    await root.call(market, 'approve_report', {report_id: "design_1R0", proof: "proof_1"}, {attachedDeposit});

    reports = await market.view('get_reports_by_object_id', {object_id: "design_1"});
    t.deepEqual(reports[0], {object_id: "design_1", reporter: bob.accountId, report: "report_1", report_id: 0, approved: true, proof: "proof_1", deposit: "0", timeStamp: reports[0].timeStamp});

    const pool = await market.view("get_pool_amount", {});
    t.is(pool, "25000000000000000000000");
});
