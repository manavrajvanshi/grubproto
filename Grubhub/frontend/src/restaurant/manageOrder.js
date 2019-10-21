import React from 'react';
import cookie from 'react-cookies';
import axios from 'axios';
import {Redirect} from 'react-router';
import '../App.css';
let re = null;
let flag = false;

var enVar = require ('../enVar.js');
const nodeAddress = enVar.nodeAddress;

let orderTable=[];
export default class ManageOrder extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            orders :{},
            message:''
        }

        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.createTable = this.createTable.bind(this);

    }


    createTable(){
        axios.defaults.withCredentials = true;
        let data = {
            rid : cookie.load('ownerData').rid
        }
        axios.post(nodeAddress+'restaurant/viewOrders',data)
            .then(response => {
                if(response.status === 200){
                    flag = true;
                    this.setState({
                        orders:response.data
                    }, ()=>{
                        let orders = this.state.orders;
                         
                        for(let order of orders){
                            let {oid,itemList,buyerName,status,total,address} = order;
                            orderTable.push(
                                <tr>
                                    
                                    <th>Buyer Name: {buyerName}</th>
                                    <th>Total: ${total } </th>
                                    <th>Status: {status}</th>
                                    <th>Delivery Address</th>
                                    
                                </tr>
                            )

                            orderTable.push(
                                <tr>
                                    <th>Item</th>

                                    <th>Quantity</th>
                                    <th>
                                        <select className = "inp" name = {oid} onChange = {this.handleStatusChange}>
                                            <option defaultValue value ={status}>Set Status</option>
                                            <option value="New">New</option>
                                            <option value="Preparing">Preparing</option>
                                            <option value="Ready">Ready</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </th>
                                    <th>{address}</th>
                                </tr>
                            )

                            for(let item of itemList){
                                //console.log(item);
                                orderTable.push(
                                    <tr>
                                        <td >{item.itemName}</td>
                                        <td >{item.qty}</td>
                                        
                                    </tr>
                                )
                            }
                        }
                        this.setState({})
                    })
                }else{
                    console.log(response.data);
                    this.setState({message: "No orders to display"})
                }
                
            }).catch(error=>{
                console.log("Error: "+JSON.stringify(error.data));
                
            }
        );
    }

    handleStatusChange(e){
        let oid = e.target.name;
        let status = e.target.value;

        let data = {
            'oid':oid,
            'status':status
        }

        axios.defaults.withCredentials = true;
            
            axios.post(nodeAddress+'restaurant/updateStatus',data)
            .then(response => {
                if(response.status === 200){
                    console.log(response.data);
                    orderTable = [];
                    this.createTable();
                    
                }else{
                    console.log("Status Not Updated");
                    console.log(response.data);
                }
                
            }).catch(error=>{
                console.log("Error: "+JSON.stringify(error.data));
            }
        );
    }
    
    componentDidMount(){
        this.createTable();
    }
    render(){

        if(cookie.load('authCookieo') !== "authenticated" ){
            re = <Redirect to = "/welcome"/>
        }
        if(!flag){
            return(
                <div>
                    {this.state.message}
                </div>
            )
        }
        return(
            <div className = "menuContainer">
                {re}
                <table className = "menu">
                    
                    <tbody>
                        {orderTable}
                    </tbody>
                </table>
            </div>
        )
    }
}