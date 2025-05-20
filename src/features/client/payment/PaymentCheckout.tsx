import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Spin,
  message,
  Checkbox,
} from 'antd';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useNavigate, useParams } from 'react-router-dom';
import { createPaymentIntent, markCertificatePaid } from '../../../services/clientService';
import '../../../styles/PaymentCheckout.css'; 


const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'inherit',
      '::placeholder': { color: '#c4c4c4' },
    },
  },
};


interface BillingInfo {
  companyName: string;
  vatNumber: string;
  address: string;
  agree: boolean;
}

const PaymentCheckout: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setSecret] = useState('');
  const [amountEUR, setAmt] = useState<number>();
  const [loading, setLoad] = useState(false);

 
  useEffect(() => {
    if (!certificateId) {
      navigate('/user/payments');
      return;
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }

    (async () => {
      try {
        setLoad(true);
        
        const { clientSecret, amount } = await createPaymentIntent(Number(certificateId), token);
        setSecret(clientSecret);
        setAmt(amount / 100); // convert cents to €
      } catch (err: any) {
        message.error(err.message || 'Could not start payment');
        navigate('/user/payments');
      } finally {
        setLoad(false);
      }
    })();
  }, [certificateId, navigate]);

 
  const handleSubmit = async (values: BillingInfo) => {
    if (!stripe || !elements) {
      message.error('Stripe not loaded yet');
      return;
    }
    const card = elements.getElement(CardElement);
    if (!card) {
      message.error('Card element missing');
      return;
    }

    setLoad(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card,
          billing_details: {
            name: values.companyName,
            address: { line1: values.address },
          },
        },
      }
    );

    if (error) {
      message.error(error.message || 'Payment failed');
      setLoad(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        
        await markCertificatePaid(Number(certificateId), localStorage.getItem('authToken') || '');
        message.success('Payment successful – thank you!');
        navigate('/user/dashboard');
      } catch {
        message.error('Server error while updating certificate');
      }
    }
    setLoad(false);
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h5 className="payment-title">Grand&nbsp;Total&nbsp;(incl.&nbsp;VAT)</h5>
          <h2 className="payment-amount">€{amountEUR?.toFixed(2) || '…'}</h2>
        </div>

        {loading && <div className="payment-spinner"><Spin /></div>}

        {!!clientSecret && (
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ agree: false }}
            className="payment-form"
          >
            <Form.Item
              label="Cardholder name"
              name="companyName"
              rules={[{ required: true, message: 'Required' }]}
              className="form-group"
            >
              <Input placeholder="Cardholder name" className="form-control" />
            </Form.Item>

            <Form.Item
              label="VAT / Tax ID"
              name="vatNumber"
              rules={[{ required: true, message: 'Required' }]}
              className="form-group"
            >
              <Input placeholder="123 456 789" className="form-control" />
            </Form.Item>

            <Form.Item
              label="Billing address"
              name="address"
              rules={[{ required: true, message: 'Required' }]}
              className="form-group"
            >
              <Input.TextArea
                placeholder="Street, City, Country"
                autoSize={{ minRows: 2, maxRows: 4 }}
                className="form-control"
              />
            </Form.Item>

            <div className="card-element-container">
              <CardElement options={CARD_OPTIONS} />
            </div>

            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error('You must accept terms & conditions')
                        ),
                },
              ]}
              className="form-group"
            >
              <Checkbox>
                I agree to the <a href="/">Terms &amp; Conditions</a>
              </Checkbox>
            </Form.Item>

            <div className="button-container">
              <Button
                className="btn btn-secondary"
                onClick={() => navigate('/user/payments')}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="btn btn-primary"
                loading={loading}
              >
                Pay
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default PaymentCheckout;
