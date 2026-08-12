
    
    const onClickDownload = (e) => {
        e.preventDefault();
        let data={fileName:$(e.target).attr('data-path'),
            title:$(e.target).attr('data-title'),
            name:$(e.target).attr('data-name')};
        return axios.post("/file-download", data,{
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/json;'
            },
        })
        .then(response => {
            const blob = new Blob([response.data],{type:response.headers["content-type"]});
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = $(e.target).html();
            document.body.appendChild(a);
            a.click();
        })

    };

