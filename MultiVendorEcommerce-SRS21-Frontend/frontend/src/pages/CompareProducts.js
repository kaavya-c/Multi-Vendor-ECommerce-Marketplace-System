import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function CompareProducts() {
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState({});
    const [reviews, setReviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function loadComparison() {
            try {
                const query = window.location.hash.split('?ids=')[1];

                if (!query) {
                    setMessage('No products selected for comparison.');
                    setLoading(false);
                    return;
                }

                const ids = query.split(',');

                // Load product details
                const productData = await Promise.all(
                    ids.map(id => api.product(id))
                );

                setProducts(productData);

                // Load variants and reviews for every product
                const variantData = await Promise.all(
                    ids.map(id => api.variants(id))
                );

                const reviewData = await Promise.all(
                    ids.map(id => api.reviews(id))
                );

                const variantMap = {};
                const reviewMap = {};

                ids.forEach((id, index) => {
                    variantMap[id] = variantData[index];
                    reviewMap[id] = reviewData[index];
                });

                setVariants(variantMap);
                setReviews(reviewMap);
            } catch (err) {
                setMessage(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadComparison();
    }, []);

    if (loading) {
        return <p>Loading comparison...</p>;
    }

    if (message) {
        return (
            <div>
                <h1>Compare Products</h1>

                <div className="card">
                    <p>{message}</p>

                    <a className="button" href="#/marketplace">
                        Back to Marketplace
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="row">
                <div>
                    <h1>Compare Products</h1>

                    <p className="muted">
                        Compare selected products side by side.
                    </p>
                </div>

                <a className="button secondary" href="#/marketplace">
                    Back to Marketplace
                </a>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '20px'
                    }}
                >
                    <thead>
                    <tr>
                        <th
                            style={{
                                textAlign: 'left',
                                padding: '15px',
                                borderBottom: '1px solid #ddd'
                            }}
                        >
                            Attribute
                        </th>

                        {products.map(product => (
                            <th
                                key={product.id}
                                style={{
                                    textAlign: 'left',
                                    padding: '15px',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                {product.title}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {/* Image */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Image</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                {product.imageUrl ? (
                                    <img
                                        className="product-image"
                                        src={product.imageUrl}
                                        alt={product.title}
                                    />
                                ) : (
                                    <div className="product-image" />
                                )}
                            </td>
                        ))}
                    </tr>

                    {/* Brand */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Brand</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                {product.brand || 'N/A'}
                            </td>
                        ))}
                    </tr>

                    {/* Price */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Price</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                ₹
                                {Number(
                                    product.sellingPrice || 0
                                ).toLocaleString('en-IN')}
                            </td>
                        ))}
                    </tr>

                    {/* Category */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Category</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                {product.category?.name || 'N/A'}
                            </td>
                        ))}
                    </tr>

                    {/* Status */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Status</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                {product.status || 'N/A'}
                            </td>
                        ))}
                    </tr>

                    {/* Description */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Description</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                {product.description || 'N/A'}
                            </td>
                        ))}
                    </tr>

                    {/* Variants */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Variants</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                {variants[product.id]?.length ? (
                                    variants[product.id].map(variant => (
                                        <div
                                            key={variant.id}
                                            style={{
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <strong>
                                                {variant.sku}
                                            </strong>

                                            <br />

                                            Model:{' '}
                                            {variant.model || 'N/A'}

                                            <br />

                                            Colour:{' '}
                                            {variant.colour || 'N/A'}

                                            <br />

                                            Price: ₹
                                            {Number(
                                                variant.price || 0
                                            ).toLocaleString('en-IN')}

                                            <br />

                                            Stock:{' '}
                                            {variant.stockQuantity ?? 0}
                                        </div>
                                    ))
                                ) : (
                                    'No variants'
                                )}
                            </td>
                        ))}
                    </tr>

                    {/* Rating */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Rating</strong>
                        </td>

                        {products.map(product => {
                            const productReviews =
                                reviews[product.id] || [];

                            const average =
                                productReviews.length
                                    ? (
                                        productReviews.reduce(
                                            (sum, review) =>
                                                sum +
                                                Number(
                                                    review.rating || 0
                                                ),
                                            0
                                        ) /
                                        productReviews.length
                                    ).toFixed(1)
                                    : null;

                            return (
                                <td
                                    key={product.id}
                                    style={{ padding: '15px' }}
                                >
                                    {average
                                        ? `★ ${average} / 5`
                                        : 'No ratings yet'}
                                </td>
                            );
                        })}
                    </tr>

                    {/* Reviews */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Reviews</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                {reviews[product.id]?.length || 0}
                            </td>
                        ))}
                    </tr>

                    {/* Action */}
                    <tr>
                        <td style={{ padding: '15px' }}>
                            <strong>Action</strong>
                        </td>

                        {products.map(product => (
                            <td
                                key={product.id}
                                style={{ padding: '15px' }}
                            >
                                <a
                                    className="button"
                                    href={`#/products/${product.id}`}
                                >
                                    View Product
                                </a>
                            </td>
                        ))}
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}