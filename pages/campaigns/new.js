import React, { Component } from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import factory from '../../factory';
import { Router } from '../../routes';

class CampaignNew extends Component {
    state = {
        minimumContribution: '',
        errorMessage: '',
        loading: false
    };

    onSubmit = async event => {
        event.preventDefault();

        this.setState({ loading: true, errorMessage: '' });

        try {
        // Request MetaMask connection first
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await factory.methods.createCampaign(this.state.minimumContribution).send({
            from: accounts[0]
        });

        Router.pushRoute('/');
        } catch (error) {
            this.setState({ errorMessage: error.message });
        }
    };
    render() {
        return (
            <Layout>
                <h3>Create a Campaign</h3>

                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Minimum Contribution (100wei)</label>
                        <Input 
                        label="wei" 
                        labelPosition="right"
                        value={this.state.minimumContribution}
                        onChange={event => 
                            this.setState({ minimumContribution: event.target.value })}
                        />
                    </Form.Field>
                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Button loading={this.state.loading} primary>Create!</Button>
                </Form>
            </Layout>
        );
    }
}

export default CampaignNew;