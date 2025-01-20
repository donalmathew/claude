const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    orgId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    parentOrganization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    level: {
        type: Number,
        required: true  // 0 for College, 1 for IEEE, etc.
    },
    isVenueManager: {
        type: Boolean,
        default: false  // true for CGPU
    }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);