export class Report {
    reporter: string;
    object_id: string;
    deposit: string;
    report: string;
    report_id: number;
    approved: boolean;
    proof: string;
    timeStamp: string;

    constructor(
        {
            reporter,
            object_id,
            report,
            report_id,
            timeStamp,
            deposit
        }:{
            reporter: string,
            object_id: string,
            report: string,
            report_id: number,
            timeStamp: string,
            deposit: string
        }) {
        this.reporter = reporter;
        this.object_id = object_id;
        this.report = report;
        this.report_id = report_id;
        this.approved = false;
        this.proof = "";
        this.timeStamp = timeStamp;
	this.deposit = deposit;
    }
}
