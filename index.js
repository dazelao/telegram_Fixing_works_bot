const token = '';
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(token, {
    polling: true
});

let counter = 0;
// запуск
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    let usersData = [];
    try {
        usersData = JSON.parse(fs.readFileSync('usersData.txt'));
    } catch (err) {
        console.error(err);
    }

    let userData = usersData.find((user) => user.id === chatId);
    if (!userData) {
        userData = {
            id: chatId
        };
        usersData.push(userData);
    }

    if (!userData.ldap) {
        bot.sendSticker(chatId, 'CAACAgIAAxkBAAEHiTtj2aeAI7lssbewvhTBqTrvqND9OQACIgMAAjVOrwLdtOMJCEmJjy0E');
        bot.sendMessage(chatId, 'Укажи свой LDAP:');
        const ldap = await new Promise((resolve) => {
            bot.once('message', (msg) => {
                resolve(msg.text);
            });
        });

        userData.ldap = ldap;
        fs.writeFileSync('usersData.txt', JSON.stringify(usersData));
    }
    bot.sendSticker(chatId, 'CAACAgIAAxkBAAEHiT1j2aemWftDElEEAAFizcDVK7hAwdIAAn4CAAI1Tq8CqLH6XDcac6ktBA');
    bot.sendMessage(chatId, 'LDAP записан', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Запустить обработку',
                    callback_data: '/getResult'
                }],
            ],
        },
    });
});

// модуль отправки файлов


bot.onText(/\/sendbotdata/, (msg) => {
    const chatId = msg.chat.id;
    const filePath = `путь к файлу записи`;
    bot.sendDocument(chatId, filePath)
        .then(() => {
            bot.sendMessage(chatId, 'Записи пользователей');
        })
        .catch((error) => {
            console.error(error);
        });
});

bot.onText(/\/senduserdata/, (msg) => {
    const chatId = msg.chat.id;
    const filePath = `путь к файлу записи`;
    bot.sendDocument(chatId, filePath)
        .then(() => {
            bot.sendMessage(chatId, 'Список пользователей');
        })
        .catch((error) => {
            console.error(error);
        });
});
// модуль очистки микро бд
bot.onText(/\/cleardata/, async (msg) => {
    const chatId = msg.chat.id;
    const filePath = `путь к файлу записи`;

    await bot.sendDocument(chatId, filePath)
        .then(() => {
            bot.sendMessage(chatId, 'File sent');
        });

    fs.writeFileSync('totalComment.txt', '');
    bot.sendMessage(chatId, 'File cleared');
});


// проверка лдапа
bot.onText(/\/myldap/, (msg) => {
    const chatId = msg.chat.id;

    let usersData = [];
    try {
        usersData = JSON.parse(fs.readFileSync('usersData.txt'));
    } catch (err) {
        console.error(err);
    }

    const userData = usersData.find((user) => user.id === chatId);
    if (!userData || !userData.ldap) {
        bot.sendMessage(chatId, 'Лдап не записан');
    } else {
        bot.sendMessage(chatId, `LDAP который ты указал: ${userData.ldap}`);
    }
});



// колбеки

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;

    let usersData = [];
    try {
        usersData = JSON.parse(fs.readFileSync('usersData.txt'));
    } catch (err) {
        console.error(err);
    }

    const userData = usersData.find((user) => user.id === chatId);

    if (!userData || !userData.ldap) {
        bot.sendMessage(chatId, 'LDAP не записан. Используй /start для записи.');
        return;
    }
    let isGoWorkButtonPressed = false;


    //колбек для вызова меню

    if (callbackQuery.data === '/getResult' && !isGoWorkButtonPressed) {
        isGoWorkButtonPressed = true;
            bot.sendMessage(chatId, 'Выбери свою дополнительную работу', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Чат с партнером',
                            callback_data: '/chat'
                        },
                            {
                                text: 'Обработка почты',
                                callback_data: '/email'
                            },
                            {
                                text: 'Прозвон',
                                callback_data: '/phone'
                            }
                        ]
                    ]
                }
            });
    }


    //колбек для прозвона


    if (callbackQuery.data === '/phone') {
            await bot.sendSticker(chatId, 'CAACAgIAAxkBAAEHiVBj2aw1vufLf4SbysfwUGTmM37-DgACVxwAAsHVQEhHf_Ohy5_EFC0E');
             await bot.sendMessage(chatId, 'Укажи номер на который звонил');
                const phone = await new Promise((resolve) => {
                    bot.once('message', (msg) => {
                        counter++
                        resolve(msg.text);
                    });
                });
        await bot.sendMessage(chatId, 'Добавь краткое описание, для чего мы звонили');
            const subject = await new Promise((resolve) => {
                bot.once('message', (msg) => {
                    resolve(msg.text);
                });
            });
            const date = new Date();
            fs.appendFileSync('totalComment.txt', `${date} ${userData.ldap}, Заявка №${counter} Телефон: ${phone} Описание: ${subject}\n`);
        await bot.sendMessage(chatId, 'Заявка записана');

        await  bot.sendMessage(chatId, 'Поработаем еще ?', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Запустить обработку',
                            callback_data: '/getResult'
                        }]
                    ]
                }
            });
            }


    //колбек для чата


    if (callbackQuery.data === '/chat') {
        await bot.sendSticker(chatId, 'CAACAgIAAxkBAAEHiVJj2axhN8TatTw75c_xFiYvwxJLfAAC3B0AAtubCEtLAs9VNwvDdy0E');
        await bot.sendMessage(chatId, 'Укажи название партнера с которым общался');
        const chat = await new Promise((resolve) => {
            bot.once('message', (msg) => {
                counter++
                resolve(msg.text);
            });
        });
        await bot.sendMessage(chatId, 'Укажи описание запроса');
        const subject = await new Promise((resolve) => {
            bot.once('message', (msg) => {
                resolve(msg.text);
            });
        });

        const date = new Date();
        fs.appendFileSync('totalComment.txt', `${date} ${userData.ldap} Заявка №${counter} Партнер: ${chat} Описание: ${subject}\n`);
        await bot.sendMessage(chatId, 'Ответ записан');

        await  bot.sendMessage(chatId, 'Поработаем еще ?', {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'Запустить обработку',
                        callback_data: '/getResult'
                    }]
                ]
            }
        });
    }

    // коллбек для почты


    if (callbackQuery.data === '/email') {
        await bot.sendSticker(chatId, 'CAACAgIAAxkBAAEHiVhj2aySb092e2QszGCC35xK-g9LiwAC_BYAAnFOCUso3IATbXMTBi0E');
        await   bot.sendMessage(chatId, 'Укажи email которому давал ответ');
            const email = await new Promise((resolve) => {
                bot.once('message', (msg) => {
                    counter++
                    resolve(msg.text);
                });
            });

        await   bot.sendMessage(chatId, 'Укажи описание запроса');
            const subject = await new Promise((resolve) => {
                bot.once('message', (msg) => {
                    resolve(msg.text);
                });
            });

            const date = new Date();
            fs.appendFileSync('totalComment.txt', `${date} ${userData.ldap} Заявка №${counter} Email: ${email} Описание: ${subject}\n`);
        await    bot.sendMessage(chatId, 'Ответ записан');


        await    bot.sendMessage(chatId, 'Поработаем еще ?', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Запустить обработку',
                            callback_data: '/getResult'
                        }]
                    ]
                }
            });
    }
})