import xl from 'excel4node'
import path from 'path'

export const makeFile = (basketItems, user, message) => {

    let endRow = 0;

    const wb = new xl.Workbook()

    const ws = wb.addWorksheet('zamowienie')
    
    const styleHeadline = wb.createStyle({
        font: {
            bold: true,
            size: 12,
        }
    })
    const styleOrder = wb.createStyle({
        font: {
            size: 12,
            color: '#010236'
        }
    })

    const styleInformation = wb.createStyle({
        font: {
            bold: true,
            size: 16
        }
    })

    const styleMessage = wb.createStyle({
        font: {
            size: 14
        }
    })
 
    ws.cell(1, 1).string('ID.').style(styleHeadline)
    ws.cell(1, 2).string('Nazwa').style(styleHeadline)
    ws.cell(1, 3).string('Kolor').style(styleHeadline)
    ws.cell(1, 4).string('Rozmiar').style(styleHeadline)
    ws.cell(1, 5).string('EAN').style(styleHeadline)
    ws.cell(1, 6).string('ilosc').style(styleHeadline)

    // biuro@eurobest.pl

    basketItems.forEach((item, index) => {
        ws.cell((index + 2), 1).number(index + 1).style(styleOrder)
        ws.cell((index + 2), 2).string(item.name).style(styleOrder)
        ws.cell((index + 2), 3).string(item.color).style(styleOrder)
        ws.cell((index + 2), 4).string(item.size).style(styleOrder)
        ws.cell((index + 2), 5).number(parseInt(item.ean)).style(styleOrder)
        ws.cell((index + 2), 6).number(parseInt(item.quantity)).style(styleOrder)

        endRow = index
    });

    ws.cell((endRow + 4), 1).string(`Wygenerowane zamowienie uzytkownika ${user.email} (${user.NIP})`).style(styleInformation)

    ws.cell((endRow + 6), 1).string(message).style(styleMessage)


    wb.write(path.join(__dirname, '/order.xlsx'))
}


