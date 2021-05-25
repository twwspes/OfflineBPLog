export const sendPictureToGetNumberBack = async (imageURL, token) => {

    try {
        if (!(imageURL.uri === "" || imageURL === null)) {
            // timer = setTimeout(() => {
            const fileName = imageURL.split('/').pop();
            console.log("uploading OCR photo name");
            console.log(fileName);
            // const file = DataURIToBlob("data:image/jpeg;base64," + imageURL.base64);
            // const responseFromBase64 =  await fetch("data:image/jpeg;base64," + avatar.base64);
            // const blob = await responseFromBase64.blob();
            //     .then(res => { res.blob() })
            //     .then(blob => {
            const fd = new FormData();
            // const file = new File([blob], fileName);
            // fd.append('file', file, fileName);
            // fd.append('file', { uri: Platform.OS == 'ios' ? imageURL.uri.replace("file://", "/private") : imageURL.uri, name: fileName, type: 'image/jpg' });
            fd.append('file', { uri: Platform.OS == 'ios' ? imageURL : imageURL, name: fileName, type: 'image/jpg' });
            // console.log('FormData');
            // console.log(fd);
            // FileSystem.uploadAsync(
            // );

            const responseFromOCRServer = await fetch("https://ocr.asform.live:9000/",
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    body: fd
                }
            );

            if (!responseFromOCRServer.ok) {
                if (parseInt(response.status) === 401) {
                    dispatch(authActions.loginByRefreshToken(null));
                }
                switch (locale) {
                    case "en":
                        throw new Error('Failed to deliver picture to OCR server!\nStatus Code: ' + response.status);
                    case "zh_CN":
                        throw new Error('傳送相片到OCR伺服器时出现错误!\n错误编号: ' + response.status);
                }
                throw new Error('傳送相片到OCR伺服器時出現錯誤!\n' + response.status);
            } else {
                const resDataFromOCR = await responseFromOCRServer.json();
                console.log("resDataFromOCR");
                console.log(resDataFromOCR);
                if (resDataFromOCR.result === "0") {
                    // console.log(JSON.parse(resDataFromOCR.data));
                    const data1 = resDataFromOCR.data.replace("[", "");
                    const data2 = data1.replace("]", "");
                    const data3 = data2.split("'").join("")
                    const array = data3.split(", ");
                    return array;
                } else {
                    return ['', '', ''];
                }

            }




            // const resData = response.text.toString();

            // console.log('upload ocr photo! successfully ');
            // console.log(resData);

            // });
            // }, 5000);
        }
    } catch (error) {
        console.log(error);
    }

};