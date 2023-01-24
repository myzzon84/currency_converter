import './app.scss';

import { useState, useEffect } from 'react';

const App = () => {
    const _apiNBU = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json';

    const _apiPrivatbank = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [bank, setBank] = useState(_apiNBU);
    const [activeInp, setActiveInp] = useState('');

    const [usdValue, setUsdValue] = useState('');
    const [euroValue, setEuroValue] = useState('');
    const [grnValue, setGrnValue] = useState('');

    useEffect(() => {
        const fetchData = (url) => {
            fetch(url)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Could not fetch ${url}, status: ${res.status}`);
                    } else {
                        return res;
                    }
                })
                .then(res => res.json())
                .then(data => {
                    if (bank === _apiNBU) {
                        let temp = data.filter((item) => {
                            return item.r030 === 978 || item.r030 === 840
                        });
                        return temp.map((item) => {
                            return { currency: item.cc, rate: item.rate }
                        });
                    } else {
                        let newData = data.map((item) => {
                            return { currency: item.ccy, rate: Number(item.buy) }
                        });
                        return newData.reverse();
                    }

                })
                .then(data => {
                    setData(data);
                    setLoading(!loading);
                })
                .catch(() => {
                    setError(!error);
                })
        }
        fetchData(bank);
        // eslint-disable-next-line
    }, [bank]);

    let Bank = 'bank';
    let BankSelected = 'bank selected'

    const changeBank = (e) => {
        if (e.target.className.includes('selected')) {
            return;
        }
        if (e.target.getAttribute('data') === 'nbu') {
            setBank(_apiNBU);
            setLoading(true);
            setError(false);

        }
        if (e.target.getAttribute('data') === 'privat') {
            setBank(_apiPrivatbank);
            setLoading(true);
            setError(false);
        }
    }

    useEffect(() => {
        if (activeInp === 'usd') {
            setEuroValue((Math.round((data[0].rate / data[1].rate) * usdValue * 100)) / 100);
            setGrnValue((Math.round(usdValue * data[0].rate * 100)) / 100);
        }
        if (activeInp === 'euro') {
            setUsdValue((Math.round((data[1].rate / data[0].rate) * euroValue * 100)) / 100);
            setGrnValue((Math.round(data[1].rate * euroValue * 100)) / 100);
        }
        if (activeInp === 'grn') {
            setUsdValue((Math.round(grnValue / data[0].rate * 100)) / 100);
            setEuroValue((Math.round(grnValue / data[1].rate * 100)) / 100);
        }
        // eslint-disable-next-line
    }, [data]);

    useEffect(() => {
        if (error) {
            setUsdValue('');
            setEuroValue('');
            setGrnValue('');
        }
    }, [error]);

    let usd = `USD : ${loading ? 'Loading...' : data[0].rate}`;
    let euro = `EUR : ${loading ? 'Loading...' : data[1].rate}`;
    let errorFetchUsd = error ? 'Error' : usd;
    let errorFetchEuro = error ? 'Error' : euro;

    let onChangeInput = (e) => {
        if (error) {
            return;
        }
        if (e.target.getAttribute('data') === 'usd') {
            setActiveInp(e.target.getAttribute('data'));
            setUsdValue(e.target.value);
            setEuroValue((Math.round((data[0].rate / data[1].rate) * e.target.value * 100)) / 100);
            setGrnValue((Math.round(e.target.value * data[0].rate * 100)) / 100);
        }
        if (e.target.getAttribute('data') === 'euro') {
            setActiveInp(e.target.getAttribute('data'));
            setEuroValue(e.target.value);
            setUsdValue((Math.round((data[1].rate / data[0].rate) * e.target.value * 100)) / 100);
            setGrnValue((Math.round(data[1].rate * e.target.value * 100)) / 100);
        }
        if (e.target.getAttribute('data') === 'grn') {
            setActiveInp(e.target.getAttribute('data'));
            setGrnValue(e.target.value);
            setUsdValue((Math.round(e.target.value / data[0].rate * 100)) / 100);
            setEuroValue((Math.round(e.target.value / data[1].rate * 100)) / 100);
        }
    }

    let onFocus = (e) => {
        if (e.target.value === '0') {
            e.target.value = '';
        }

    }

    return (
        <div className="appWrapper">
            <div className="selectedBank">
                <div
                    className={bank === _apiNBU ? BankSelected : Bank}
                    data='nbu'
                    onClick={changeBank}
                >
                    {'НБУ'}
                </div>
                <div
                    className={bank === _apiPrivatbank ? BankSelected : Bank}
                    data='privat'
                    onClick={changeBank}
                >
                    {'Приват'}
                </div>
            </div>
            <div className="currentBankCourse">
                <div className="currentBankTitle">
                    {bank === _apiNBU ? 'НБУ' : 'ПриватБанк'}
                </div>
                <span className="usd info">
                    {errorFetchUsd}
                </span>
                <span className="euro info">
                    {errorFetchEuro}
                </span>
            </div>
            <div className="calculatorWrapper">
                <div className="usdBlock block">
                    <span className="title">
                        {'USD = '}
                    </span>
                    <input
                        className='input'
                        type="number"
                        data='usd'
                        value={usdValue}
                        onChange={onChangeInput}
                        onFocus={onFocus} />
                </div>
                <div className="euroBlock block">
                    <span className="title">
                        {'EUR = '}
                    </span>
                    <input
                        className='input'
                        type="number"
                        data='euro'
                        value={euroValue}
                        onChange={onChangeInput}
                        onFocus={onFocus} />
                </div>
                <div className="grnBlock block">
                    <span className="title">
                        {'GRN = '}
                    </span>
                    <input
                        className='input'
                        type="number"
                        data='grn'
                        value={grnValue}
                        onChange={onChangeInput}
                        onFocus={onFocus} />
                </div>
            </div>
        </div>
    );
}

export default App;