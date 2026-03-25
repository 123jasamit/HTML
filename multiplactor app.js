class MyForm extends React.Component {
    render() {
        return(
            <form>
                <div className = "container">
                    <h1>Multiplicator</h1>
                    <div className = "form-group">
                        <label>Enter Operand 1</label>
                        <input type = "number" id = "num1"
                            ref = {this.op1Ref}
                            placeholder = "Enter Operand 1" />
                    </div>
                    <div className = "form-group">
                        <label>Enter Operand 2</label>
                        <input type = "number" id = "num2"
                            ref = {this.op2Ref}
                            placeholder = "Enter Operand 2" />
                    </div>
                    <p ref = {this.resultRef}></p>
                    <button type = "button" className = "btn " onClick={
                    () => this.mysubmit()}>Multiply</button>
                </div>
            </form>
        );
    }
}
ReactDOM.render(<MyForm/>, document.getElementById("root"));
