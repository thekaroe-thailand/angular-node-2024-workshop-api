const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    create: async (req, res) => {
        try {
            const organization = await prisma.organization.findFirst();

            const payload = {
                name: req.body.name,
                address: req.body.address,
                phone: req.body.phone ?? '',
                email: req.body.email ?? '',
                taxCode: req.body.taxCode ?? '',
                logo: req.body.logo ?? organization.logo ?? '',
                website: req.body.website ?? '',
                promptPay: req.body.promptPay ?? ''
            }

            if (organization) {
                await prisma.organization.update({
                    where: {
                        id: organization.id
                    },
                    data: payload
                })
            } else {
                await prisma.organization.create({
                    data: payload
                })
            }

            return res.send({ message: 'success' })
        } catch (e) {
            return res.status(500).send({ error: e.message })
        }
    },
    info: async (req, res) => {
        try {
            const row = await prisma.organization.findMany();
            return res.send(row[0] ?? {});
        } catch (e) {
            return res.status(500).send({ error: e.message })
        }
    },
    upload: async (req, res) => {
        try {
            const myFile = req.files.myFile;
            const fileName = myFile.name;

            // rename file
            const extention = fileName.split('.').pop();
            const newName = new Date().getTime() + '.' + extention;

            // move file to public folder
            myFile.mv('uploads/' + newName, (err) => {
                if (err) {
                    throw err;
                }
            })

            return res.send({ message: 'success', fileName: newName });
        } catch (e) {
            return res.status(500).send({ error: e.message })
        }
    }
}


/*












*/