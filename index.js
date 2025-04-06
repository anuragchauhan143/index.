// ... (Previous code remains same until routes)

// Admin Routes
app.get('/admin', (req, res) => {
    const { email, password } = req.query;
    if (email === 'anuragchauhan78760@gmail.com' && password === '__anurag__chauhan__') {
        res.redirect('/admin/dashboard');
    } else {
        res.status(401).send('Unauthorized. Use email: anuragchauhan78760@gmail.com and password: __anurag__chauhan__');
    }
});

app.get('/admin/dashboard', (req, res) => {
    const { email, password } = req.query;
    if (email === 'anuragchauhan78760@gmail.com' && password === '__anurag__chauhan__') {
        Promise.all([Product.find(), Order.find(), User.find()])
            .then(([products, orders, users]) => {
                res.render('admin', { products, orders, users });
            });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// ... (Rest of the code remains same)
