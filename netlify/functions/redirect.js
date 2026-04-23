exports.handler = async (event) => {
    // 1. Pega o slug e limpa barras
    const slug = event.path.split('/').filter(Boolean).pop();
    console.log(`LOG: Buscando pelo slug: [${slug}]`);

    const NOCODB_API_KEY = "AZ-75uL73daFrCSd4YH-6SRzTQGXqxO4wz-3nHVF";
    const NOCODB_TABLE_URL = "https://noco-nocodb.wewdsc.easypanel.host/api/v1/db/data/v1/p3avirysfwsticf/mf22l7zpcov4sda";

    try {
        // 2. Busca com 'slug' (minúsculo) para bater com sua tabela
        const response = await fetch(`${NOCODB_TABLE_URL}?where=(slug,eq,${slug})`, {
            method: 'GET',
            headers: { 'xc-token': NOCODB_API_KEY }
        });

        const data = await response.json();
        const registro = data.list && data.list[0];

        if (registro) {
            // Ajustado para os nomes exatos da sua imagem
            const targetUrl = registro.url_original;
            const rowId = registro.Id || registro.id; // NocoDB geralmente envia Id

            console.log(`LOG: Sucesso! Registro achado. ID: ${rowId} | Indo para: ${targetUrl}`);

            if (!targetUrl) {
                return { statusCode: 200, body: "A coluna url_original esta vazia no banco." };
            }

            // 3. Avisa o n8n (Substitua quando tiver o link real)
            // 3. Avisa o n8n e ESPERA a resposta
            const n8nWebhook = 'https://n8n-n8n.wewdsc.easypanel.host/webhook/registrar-clique'; // Use o Production URL

            try {
                // Adicionamos o 'await' aqui para a função não fechar antes de enviar
                await fetch(n8nWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rowId, slug, timestamp: new Date().toISOString() })
                });
                console.log("LOG: n8n avisado com sucesso.");
            } catch (e) {
                console.error("LOG: Falha ao avisar o n8n:", e.message);
            }

            // 4. Redirecionamento
            return {
                statusCode: 302,
                headers: {
                    'Location': targetUrl,
                    'Cache-Control': 'no-cache'
                },
                body: '',
            };
        }



        console.log(`LOG: Slug [${slug}] nao existe no banco.`);
        return { statusCode: 404, body: "Link nao encontrado no Garimpo." };

    } catch (error) {
        console.error("LOG ERRO:", error.message);
        return { statusCode: 500, body: "Erro de conexao com o banco." };
    }
};