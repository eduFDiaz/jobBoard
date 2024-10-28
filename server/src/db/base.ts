export abstract class Item {
    abstract get pk(): string
    abstract get sk(): string

    abstract get gsi1pk(): string
    abstract get gsi1sk(): string 

    public keys() {
        return {
            PK: { S: this.pk },
            SK: { S: this.sk }
        }
    }

    public gsi1Keys() {
        return {
            GSI1PK: { S: this.gsi1pk },
            GSI1SK: { S: this.gsi1sk }
        }
    }

    abstract toItem(): Record<string, unknown>
}