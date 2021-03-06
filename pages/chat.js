import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

import supabaseConfig from '../supabase_config.json';

// Como fazer AJAX: https://medium.com/@omariosouto/entendendo-como-fazer-ajax-com-a-fetchapi-977ff20da3c6
const supabaseClient = createClient(supabaseConfig.URL, supabaseConfig.ANON_KEY);

function setMessageListener(addMessage) {
    return supabaseClient
        .from('message_list')
        .on('INSERT', (resp) => {
            addMessage(resp.new);
        })
        .subscribe();
}

export default function ChatPage() {

    const routing = useRouter();
    const loggedUser = routing.query.username;

    const [message, setMessage] = React.useState('');
    const [messageList, setMessageList] = React.useState([]);


    React.useEffect(() => {

        supabaseClient
            .from('message_list')
            .select('*')
            // .then((resp) => {
            //     console.log('Dados da consulta: ', resp);
            //     setMessageList(resp.data);
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                setMessageList(data);
            });

    }, []);


    const subscription = setMessageListener((newMessage) => {

        // Quero reusar um valor de referencia (objeto/array) 
        // Passar uma função pro setState

        // setListaDeMensagens([
        //     novaMensagem,
        //     ...listaDeMensagens
        // ])

        setMessageList((currentList) => {
            return [newMessage, ...currentList]
        });

    });

    function submitNewMessage(newMessage) {

        const message = {
            from: loggedUser,
            text: newMessage,
        };

        supabaseClient
            .from('message_list')
            .insert([message])          // tem que ser um objeto com os MESMOS campos
            .then(({ data }) => {
                // setMessageList([data[0], ...messageList]);
            });

        setMessage('');

    }

    function deleteMessage(id) {

        // Lista original
        console.log("Lista original: ");
        console.log(messageList);

        // Cria nova lista sem o item
        // // Filter() é executado para cada item do array. 
        // // Quando a callback retorna "false" o item não é adicionado ao novo array
        const newMessageList = messageList.filter((item) => {
            return item.id != id;
        });

        // Nova lista sem o item
        console.log("Nova lista: ");
        console.log(newMessageList);

        // Atualiza a lista
        setMessageList(newMessageList);
    }


    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    {/* 
                            Passar as funções como parâmetro!!!
                    */}

                    <MessageList
                        messages={messageList}
                        deleteMessage={deleteMessage}
                    />
                    <Box>
                        {/* CallBack */}
                        <ButtonSendSticker
                            onStickerClick={(sticker => {
                                submitNewMessage(':sticker:' + sticker);
                            })}
                        />
                    </Box>
                    <Box
                        as="form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submitNewMessage(message);
                        }}
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={(event) => {
                                const value = event.target.value;
                                setMessage(value)
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    submitNewMessage(message);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <Button
                            type='submit'
                            label='Enviar'
                            // fullWidth
                            buttonColors={{
                                contrastColor: appConfig.theme.colors.neutrals["000"],
                                mainColor: appConfig.theme.colors.primary[500],
                                mainColorLight: appConfig.theme.colors.primary[400],
                                mainColorStrong: appConfig.theme.colors.primary[600],
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {

    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >

            {props.messages.map((message) => {
                return (

                    <Text
                        key={message.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                                <Box styleSheet={{ width: '100%', display: 'flex' }}>
                                    <a href={`https://github.com/${message.from}`} target="_blank" rel="noreferrer noopener">
                                        <Image
                                            styleSheet={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                display: 'inline-block',
                                                marginRight: '8px',
                                            }}
                                            src={`https://github.com/${message.from}.png`}
                                        />
                                    </a>
                                    <Text tag="strong"
                                        styleSheet={{
                                            fontSize: '14px',
                                            marginLeft: '8px',
                                        }}
                                    >
                                        {message.from}
                                    </Text>
                                    <Text
                                        styleSheet={{
                                            fontSize: '14px',
                                            marginLeft: '8px',
                                            color: appConfig.theme.colors.neutrals[300],
                                        }}
                                        tag="span"
                                    >
                                        {(new Date(message.created_at).toLocaleDateString())}
                                    </Text>
                                </Box>
                                <Button
                                    iconName="FaRegWindowClose"
                                    onClick={() => {
                                        props.deleteMessage(message.id);
                                    }}
                                    colorVariant="neutral"
                                    variant="tertiary"
                                />
                            </Box>
                        </Box>
                        {/* [Declarativo] */}
                        {/* Condicional: {message.text.startsWith(':sticker:').toString()} */}
                        {message.text.startsWith(':sticker:')
                            ? (
                                <Image
                                    src={message.text.replace(':sticker:', '')}
                                    styleSheet={{
                                        maxWidth: '200px',
                                    }}
                                />
                            )
                            : (
                                message.text
                            )}
                    </Text>

                );

            })}
        </Box>
    )
}