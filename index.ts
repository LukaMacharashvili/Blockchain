import * as crypto from 'crypto'

class Transaction {
    constructor(
        public amount: number,
        public payer:string,
        public payee:string
    ){}

    toString(){
        return JSON.stringify(this)
    }
}

class Block {
    public n = Math.round(Math.random() * 999999999)


    constructor(
        public previousHash:any,
        public transaction:Transaction,
        public date = Date.now()
    ){}

    get hash(){
        let str = JSON.stringify(this);
        let hash = crypto.createHash('sha256')
        hash.update(str).end();
        return hash.digest('hex')
    }
}

class BlockChain {

    public static instance = new BlockChain();
    
    blockchain:Block[];

    constructor(

    ){
        this.blockchain = [new Block(null, new Transaction(1000, 'genesis', 'luka'))]
    }

    get getLastBlock(){
        return this.blockchain[this.blockchain.length-1]
    }

    mine(n:number){
        let solution = 1;
        console.log('mining....')
    
        while(true){
            let hash = crypto.createHash('MD5');
            hash.update((n + solution).toString()).end();

            let attempt = hash.digest('hex');

            if(attempt.substr(0, 4) === '0000'){
                console.log(`Solution, ${solution}`);
                return solution;
            }
            solution++
        }
    }

    addNewBlock(transaction:Transaction, senderPublicKey:string, signature:Buffer){
        let verifier = crypto.createVerify('sha256');
        verifier.update(transaction.toString())

        let isValid = verifier.verify(senderPublicKey, signature);

        if(isValid){
            let newBlock = new Block(this.getLastBlock.hash, transaction)
            this.mine(newBlock.n)
            this.blockchain.push(newBlock)
        }
    }
}

class Wallet {
    public publicKey:string;
    public privateKey:string;

    constructor(){
        let keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type:'spki', format:'pem' },
            privateKeyEncoding: { type:'pkcs8', format:'pem' }
        })

        this.publicKey = keyPair.publicKey;
        this.privateKey = keyPair.privateKey;
    }

    sendMoney(amount:number, receiverPublicKey:string){
        let transaction = new Transaction(amount, this.publicKey, receiverPublicKey);

        let sign = crypto.createSign('sha256');
        sign.update(transaction.toString()).end()
        let signature = sign.sign(this.privateKey)
        BlockChain.instance.addNewBlock(transaction, this.publicKey, signature)
    }
}

let luka = new Wallet();
let linus = new Wallet();
let eka = new Wallet();

luka.sendMoney(90, eka.publicKey);
linus.sendMoney(1000, luka.publicKey);
eka.sendMoney(600, linus.publicKey)

console.log(BlockChain.instance)